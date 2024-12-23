import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '@incognidial/db';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE') private db: NodePgDatabase,
    private readonly emailService: EmailService
  ) {}

  async register(params: {
    email?: string;
    phoneNumber?: string;
    password: string;
    name?: string;
  }) {
    if (params.password.length < 12) {
      // require 12 characters for passwords
      throw new BadRequestException(
        'Password must be at least 12 characters long.'
      );
    }

    if (!params.phoneNumber) {
      throw new BadRequestException('Phone number is required.');
    }

    const existingUsers = await this.db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, params.phoneNumber));
    if (existingUsers.length) {
      throw new BadRequestException('Phone number already exists.');
    }

    try {
      const hashedPassword = await bcrypt.hash(params.password, 10);
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
        .returning({
          id: users.resourceId,
          email: users.email,
          phoneNumber: users.phoneNumber,
        });
      if (user.email) {
        await lastValueFrom(
          this.emailService.sendConfirmationEmail(user.email, user.id)
        );
      }
      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async confirm(confirmationToken: string) {
    try {
      const [user] = await this.db
        .update(users)
        .set({
          confirmedAt: new Date(),
        })
        .where(
          and(
            eq(users.resourceId, confirmationToken),
            isNull(users.confirmedAt)
          )
        )
        .returning({
          id: users.resourceId,
        });

      if (!user) {
        throw new NotFoundException();
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async login(phoneNumber: string, password: string) {
    const [user] = await this.db
      .select({
        id: users.resourceId,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        password: users.password,
      })
      .from(users)
      .where(
        and(
          eq(users.phoneNumber, phoneNumber),
          isNull(users.disabledAt),
          isNotNull(users.confirmedAt)
        )
      );
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

  async disable(phoneNumber: string, password: string) {
    const [user] = await this.db
      .select({
        id: users.resourceId,
        password: users.password,
      })
      .from(users)
      .where(
        and(
          eq(users.phoneNumber, phoneNumber),
          isNull(users.disabledAt),
          isNotNull(users.confirmedAt)
        )
      );
    if (!user) {
      throw new NotFoundException();
    }
    const { password: passwordHash, ...restOfUser } = user;
    const passwordsMatch = await bcrypt.compare(password, passwordHash);
    if (!passwordsMatch) {
      throw new NotFoundException();
    }
    await this.db
      .update(users)
      .set({
        disabledAt: new Date(),
      })
      .where(eq(users.resourceId, user.id));
    return restOfUser;
  }
}
