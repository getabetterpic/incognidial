import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('login')
  login(
    @Body() body: { email: string; phoneNumber: string; password: string }
  ) {
    return this.usersService.login(body.email, body.phoneNumber, body.password);
  }
}
