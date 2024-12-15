import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  register(
    @Body()
    body: {
      email?: string;
      phoneNumber?: string;
      password: string;
      name?: string;
    }
  ) {
    return this.usersService.register(body);
  }

  @Post('login')
  login(
    @Body() body: { email: string; phoneNumber: string; password: string }
  ) {
    return this.usersService.login(body.email, body.phoneNumber, body.password);
  }
}
