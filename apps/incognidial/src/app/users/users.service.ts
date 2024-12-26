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
import { UserRegistrationDto } from './user-registration.dto';
import OTPAuth from 'otpauth';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE') private db: NodePgDatabase,
    private readonly emailService: EmailService
  ) {}

  async register(params: UserRegistrationDto) {
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
            otpSecret: new OTPAuth.Secret({ size: 20 }).base32,
          },
        ])
        .returning({
          id: users.resourceId,
          email: users.email,
          phoneNumber: users.phoneNumber,
          otpSecret: users.otpSecret,
        });

      if (user.email) {
        await lastValueFrom(
          this.emailService.sendConfirmationEmail(user.email, user.id)
        );
      }

      let code: string | undefined;
      if (user.otpSecret) {
        const totp = new OTPAuth.TOTP({
          issuer: 'IncogniDial',
          label: user.phoneNumber,
          secret: user.otpSecret,
        });
        code = totp.generate();
      }

      return { ...user, code };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async confirm(resourceId: string, code: string) {
    if (!code) {
      throw new NotFoundException();
    }

    const [existingUser] = await this.db
      .select({
        otpSecret: users.otpSecret,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(and(eq(users.resourceId, resourceId), isNull(users.confirmedAt)));

    if (!existingUser || !existingUser.otpSecret) {
      throw new NotFoundException();
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'IncogniDial',
      label: existingUser.phoneNumber,
      secret: existingUser.otpSecret,
    });

    const delta = totp.validate({ token: code });
    if (delta == null) {
      throw new NotFoundException();
    }

    try {
      const [user] = await this.db
        .update(users)
        .set({
          confirmedAt: new Date(),
        })
        .where(and(eq(users.resourceId, resourceId), isNull(users.confirmedAt)))
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
    const user = await this.findByPhoneNumber(phoneNumber);
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

  async resendConfirmationCode(phoneNumber: string) {
    const [user] = await this.db
      .select({
        id: users.resourceId,
        otpSecret: users.otpSecret,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(
        and(
          eq(users.phoneNumber, phoneNumber),
          isNull(users.disabledAt),
          isNull(users.confirmedAt)
        )
      );

    if (!user || !user.otpSecret) {
      throw new NotFoundException();
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'IncogniDial',
      label: user.phoneNumber,
      secret: user.otpSecret,
    });
    const code = totp.generate();
    return code;
  }

  async disable(phoneNumber: string, password: string) {
    const user = await this.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new NotFoundException();
    }
    const { password: passwordHash, ...restOfUser } = user;
    const passwordsMatch = await bcrypt.compare(password, passwordHash);
    if (!passwordsMatch) {
      throw new NotFoundException();
    }
    try {
      await this.db
        .update(users)
        .set({
          disabledAt: new Date(),
        })
        .where(eq(users.resourceId, user.resourceId));
      return restOfUser;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findByPhoneNumber(phoneNumber: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.phoneNumber, phoneNumber),
          isNotNull(users.confirmedAt),
          isNull(users.disabledAt)
        )
      );
    return user;
  }
}
