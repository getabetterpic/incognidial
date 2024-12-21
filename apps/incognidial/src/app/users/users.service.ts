import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '../../db/schema';
import { and, eq, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase) {}

  async register(params: {
    email?: string;
    phoneNumber?: string;
    password: string;
    name?: string;
  }) {
    if (params.password.length < 12) {
      throw new BadRequestException(
        'Password must be at least 12 characters long.'
      );
    }
    const hashedPassword = await bcrypt.hash(params.password, 10);

    if (!params.phoneNumber) {
      throw new BadRequestException('Phone number is required.');
    }

    if (params.email) {
      const condition = and(
        eq(users.email, params.email),
        eq(users.phoneNumber, params.phoneNumber)
      );

      const [existingUser] = await this.db
        .select()
        .from(users)
        .where(condition);
      if (existingUser) {
        throw new BadRequestException(
          'Email already exists for this phone number.'
        );
      }
    }

    if (params.phoneNumber) {
      const [existingUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.phoneNumber, params.phoneNumber));
      if (existingUser) {
        throw new BadRequestException(
          'Email already exists for this phone number.'
        );
      }
    }

    try {
      const [user] = await this.db
        .insert(users)
        .values([
          {
            phoneNumber: params.phoneNumber || '',
            email: params.email,
            password: hashedPassword,
            name: params.name,
          },
        ])
        .returning({ id: users.resourceId });
      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async login(email: string, phoneNumber: string, password: string) {
    const [user] = await this.db
      .select({
        id: users.resourceId,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        password: users.password,
      })
      .from(users)
      .where(or(eq(users.email, email), eq(users.phoneNumber, phoneNumber)));
    if (!user) {
      throw new NotFoundException();
    }
    const { password: passwordDigest, ...userWithoutPassword } = user;
    const passwordsMatch = await bcrypt.compare(password, passwordDigest);
    if (passwordsMatch) {
      return userWithoutPassword;
    }
    throw new NotFoundException();
  }
}
