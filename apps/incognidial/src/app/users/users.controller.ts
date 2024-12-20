import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FastifyRequest, FastifyReply } from 'fastify';

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
  @HttpCode(200)
  async login(
    @Body() body: { email: string; phoneNumber: string; password: string },
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    const user = await this.usersService.login(
      body.email,
      body.phoneNumber,
      body.password
    );
    reply.setCookie('_usr_session', user.resourceId, {
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
}
