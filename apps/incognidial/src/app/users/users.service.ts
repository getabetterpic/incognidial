import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '../../db/schema';
import { eq, or } from 'drizzle-orm';
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

    if (!params.email && !params.phoneNumber) {
      throw new BadRequestException('Either email or phone number is required');
    }

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
      .onConflictDoUpdate({
        target: users.phoneNumber,
        set: { name: params.name, email: params.email },
      })
      .returning({ id: users.resourceId });

    return user;
  }

  async login(email: string, phoneNumber: string, password: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.phoneNumber, phoneNumber)));
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (passwordsMatch) {
      return user;
    }
    throw new ForbiddenException();
  }
}
