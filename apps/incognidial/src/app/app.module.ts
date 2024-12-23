import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { drizzle } from 'drizzle-orm/node-postgres';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './email/email.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController, UsersController],
  providers: [
    AppService,
    UsersService,
    EmailService,
    {
      provide: 'DATABASE',
      useFactory: () => drizzle(process.env.DATABASE_URL!),
    },
  ],
})
export class AppModule {}
