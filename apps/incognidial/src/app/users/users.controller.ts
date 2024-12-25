import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { UserLoginDto } from './user-login.dto';
import { UserRegistrationDto } from './user-registration.dto';
import { UserDisableDto } from './user-disable.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  register(
    @Body()
    body: UserRegistrationDto
  ) {
    return this.usersService.register(body);
  }

  @Get('confirm/:confirmationToken')
  async confirm(@Param('confirmationToken') confirmationToken: string) {
    return this.usersService.confirm(confirmationToken);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: UserLoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    const user = await this.usersService.login(body.phoneNumber, body.password);
    reply.setCookie('_usr_session', user.id, {
      httpOnly: true,
      secure: req.protocol === 'https',
      sameSite: 'lax',
    });
    return user;
  }

  @Delete('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) reply: FastifyReply) {
    reply.clearCookie('_usr_session');
    return { success: true };
  }

  @Delete('disable')
  async disable(
    @Body() body: UserDisableDto,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    reply.clearCookie('_usr_session');
    return this.usersService.disable(body.phoneNumber, body.password);
  }
}
