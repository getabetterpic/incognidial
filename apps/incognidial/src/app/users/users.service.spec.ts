import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';

const validateSpy = jest.fn();
class MockOTP {
  validate = validateSpy;
}
jest.mock('otpauth', () => ({
  __esModule: true,
  default: {
    TOTP: jest.fn().mockImplementation(() => new MockOTP()),
    Secret: jest.fn().mockImplementation(() => ({
      base32: 'mock-secret',
    })),
  },
}));

describe('UsersService', () => {
  let service: UsersService;
  let whereSpy: jest.Mock;
  let returningSpy: jest.Mock;
  let confirmationSpy: jest.Mock;

  beforeEach(async () => {
    whereSpy = jest.fn().mockReturnThis();
    returningSpy = jest.fn().mockReturnThis();
    confirmationSpy = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: EmailService,
          useValue: {
            sendConfirmationEmail: confirmationSpy,
          },
        },
        {
          provide: 'DATABASE',
          useValue: {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: whereSpy,
            update: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            returning: returningSpy,
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw if phone number already exists', async () => {
      whereSpy.mockResolvedValueOnce([{ id: 1 }]);

      await expect(
        service.register({
          phoneNumber: '1234567890',
          password: 'longenoughpassword',
        })
      ).rejects.toThrow('Phone number already exists.');
    });

    it('should create user successfully', async () => {
      const mockUser = { id: 'uuid' };
      whereSpy.mockResolvedValue([]);
      returningSpy.mockResolvedValueOnce([mockUser]);

      const result = await service.register({
        phoneNumber: '1234567890',
        password: 'longenoughpassword',
        name: 'Test User',
      });

      expect(result).toEqual(mockUser);
    });
  });

  describe('confirm', () => {
    it('should confirm unconfirmed user', async () => {
      const mockUser = {
        id: 'uuid',
        email: 'test@test.com',
        phoneNumber: '1234567890',
        name: 'Test User',
        otpSecret: 'secret',
      };
      whereSpy.mockResolvedValueOnce([mockUser]);
      returningSpy.mockResolvedValueOnce([mockUser]);
      validateSpy.mockResolvedValueOnce(0);

      const result = await service.confirm('confirmation-token', '000000');

      expect(validateSpy).toHaveBeenCalledWith({ token: '000000' });
      expect(result).toEqual(mockUser);
    });

    it('should reactivate disabled user', async () => {
      const mockUser = {
        id: 'uuid',
        email: 'test@test.com',
        phoneNumber: '1234567890',
        name: 'Test User',
        otpSecret: 'secret',
      };
      whereSpy.mockResolvedValueOnce([mockUser]);
      returningSpy.mockResolvedValueOnce([mockUser]);
      validateSpy.mockResolvedValueOnce(0);

      const result = await service.confirm('confirmation-token', '000000');

      expect(result).toEqual(mockUser);
    });

    it('should throw not found if token is invalid', async () => {
      whereSpy.mockResolvedValueOnce([]);

      await expect(service.confirm('invalid-token', '000000')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw not found if confirmation fails', async () => {
      whereSpy.mockResolvedValueOnce([{ otpSecret: 'secret' }]);
      whereSpy.mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.confirm('confirmation-token', '000000')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('login', () => {
    it('should throw if credentials are invalid', async () => {
      whereSpy.mockResolvedValueOnce([
        {
          password: await bcrypt.hash('correctpassword', 1),
        },
      ]);

      await expect(
        service.login('1234567890', 'wrongpassword')
      ).rejects.toThrow(NotFoundException);
    });

    it('should return user if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: await bcrypt.hash('correctpassword', 1),
      };

      whereSpy.mockResolvedValueOnce([mockUser]);

      const result = await service.login('1234567890', 'correctpassword');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...restOfMockUser } = mockUser;

      expect(result).toEqual(restOfMockUser);
    });

    it('throws not found error if user does not exist', () => {
      whereSpy.mockResolvedValue([]);

      expect(service.login('1234567890', 'correctpassword')).rejects.toThrow(
        'Not Found'
      );
    });
  });

  describe('disable', () => {
    it('should throw if credentials are invalid', async () => {
      whereSpy.mockResolvedValueOnce([
        {
          password: await bcrypt.hash('correctpassword', 1),
        },
      ]);

      await expect(
        service.disable('1234567890', 'wrongpassword')
      ).rejects.toThrow(NotFoundException);
    });

    it('should return success if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: await bcrypt.hash('correctpassword', 1),
      };

      whereSpy.mockResolvedValueOnce([mockUser]);
      returningSpy.mockResolvedValueOnce([{ success: true }]);

      const result = await service.disable('1234567890', 'correctpassword');

      expect(result).toEqual({ id: 1, email: 'test@test.com' });
    });

    it('throws not found error if user does not exist', () => {
      whereSpy.mockResolvedValue([]);

      expect(service.disable('1234567890', 'correctpassword')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
