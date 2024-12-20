import { UsersController } from './users.controller';

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let usersService: any;

  beforeEach(async () => {
    usersService = {
      register: jest.fn(),
      login: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call usersService.register with correct parameters', async () => {
      const registerDto = {
        email: 'test@test.com',
        phoneNumber: '1234567890',
        password: 'longenoughpassword',
        name: 'Test User',
      };

      await controller.register(registerDto);

      expect(usersService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should return the result from usersService.register', async () => {
      const mockUser = { id: 'uuid' };
      usersService.register.mockResolvedValue(mockUser);

      const result = await controller.register({
        email: 'test@test.com',
        phoneNumber: '1234567890',
        password: 'longenoughpassword',
      });

      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should call usersService.login with correct parameters', async () => {
      const loginDto = {
        email: 'test@test.com',
        phoneNumber: '1234567890',
        password: 'correctpassword',
      };

      await controller.login(loginDto);

      expect(usersService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.phoneNumber,
        loginDto.password
      );
    });

    it('should return the result from usersService.login', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: 'hashedpassword',
      };
      usersService.login.mockResolvedValue(mockUser);

      const result = await controller.login({
        email: 'test@test.com',
        phoneNumber: '1234567890',
        password: 'correctpassword',
      });

      expect(result).toEqual(mockUser);
    });
  });
});
