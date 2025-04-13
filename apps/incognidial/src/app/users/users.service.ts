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
import parsePhoneNumber from 'libphonenumber-js';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE') private db: NodePgDatabase,
    private readonly emailService: EmailService
  ) {}

  async register(params: UserRegistrationDto) {
    const e164PhoneNumber = this.toE164(params.phoneNumber);
    const existingUsers = await this.db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, e164PhoneNumber));
    if (existingUsers.length) {
      throw new BadRequestException(
        `Phone number already exists: ${params.phoneNumber}`
      );
    }

    try {
      const hashedPassword = await bcrypt.hash(params.password, 10);
      const [user] = await this.db
        .insert(users)
        .values([
          {
            phoneNumber: e164PhoneNumber,
            password: hashedPassword,
            otpSecret: new OTPAuth.Secret({ size: 20 }).base32,
          },
        ])
        .returning({
          id: users.resourceId,
          phoneNumber: users.phoneNumber,
          otpSecret: users.otpSecret,
        });

      let code: string | undefined;
      const { otpSecret, ...restOfUser } = user;
      if (otpSecret) {
        const totp = new OTPAuth.TOTP({
          issuer: 'IncogniDial',
          label: restOfUser.phoneNumber,
          secret: otpSecret,
        });
        code = totp.generate();
      }

      return { ...restOfUser, code };
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
    const e164PhoneNumber = this.toE164(phoneNumber);
    const [user] = await this.db
      .select({
        id: users.resourceId,
        otpSecret: users.otpSecret,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(
        and(
          eq(users.phoneNumber, e164PhoneNumber),
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
    return { id: user.id, code };
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
    const e164PhoneNumber = this.toE164(phoneNumber);
    const [user] = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.phoneNumber, e164PhoneNumber),
          isNotNull(users.confirmedAt),
          isNull(users.disabledAt)
        )
      );
    return user;
  }

  toE164(phoneNumber: string) {
    const pn = parsePhoneNumber(phoneNumber, 'US');
    if (!pn?.isValid()) {
      throw new BadRequestException(`Invalid phone number: ${phoneNumber}`);
    }
    return pn?.format('E.164');
  }
}
