import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ForbiddenException } from '@nestjs/common';
import bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let whereSpy: jest.Mock;
  let returningSpy: jest.Mock;

  beforeEach(async () => {
    whereSpy = jest.fn().mockReturnThis();
    returningSpy = jest.fn().mockReturnThis();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'DATABASE',
          useValue: {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: whereSpy,
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
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
    it('should throw if password is less than 12 characters', async () => {
      await expect(
        service.register({
          phoneNumber: '1234567890',
          password: 'short',
        })
      ).rejects.toThrow('Password must be at least 12 characters long.');
    });

    it('should throw if phone number is missing', async () => {
      await expect(
        service.register({
          password: 'longenoughpassword',
        })
      ).rejects.toThrow('Phone number is required.');
    });

    it('should throw if email already exists for phone number', async () => {
      whereSpy.mockResolvedValueOnce([{ id: 1 }]);

      await expect(
        service.register({
          email: 'test@test.com',
          phoneNumber: '1234567890',
          password: 'longenoughpassword',
        })
      ).rejects.toThrow('Email already exists for this phone number.');
    });

    it('should throw if phone number already exists', async () => {
      whereSpy.mockResolvedValueOnce([{ id: 1 }]);

      await expect(
        service.register({
          phoneNumber: '1234567890',
          password: 'longenoughpassword',
        })
      ).rejects.toThrow('Email already exists for this phone number.');
    });

    it('should create user successfully', async () => {
      const mockUser = { id: 'uuid' };
      whereSpy.mockResolvedValue([]);
      returningSpy.mockResolvedValueOnce([mockUser]);

      const result = await service.register({
        email: 'test@test.com',
        phoneNumber: '1234567890',
        password: 'longenoughpassword',
        name: 'Test User',
      });

      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should throw if credentials are invalid', async () => {
      whereSpy.mockResolvedValueOnce([
        {
          password: await bcrypt.hash('correctpassword', 10),
        },
      ]);

      await expect(
        service.login('test@test.com', '1234567890', 'wrongpassword')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return user if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: await bcrypt.hash('correctpassword', 10),
      };

      whereSpy.mockResolvedValueOnce([mockUser]);

      const result = await service.login(
        'test@test.com',
        '1234567890',
        'correctpassword'
      );

      expect(result).toEqual(mockUser);
    });
  });
});