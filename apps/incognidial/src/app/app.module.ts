import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { drizzle } from 'drizzle-orm/node-postgres';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';

@Module({
  imports: [],
  controllers: [AppController, UsersController],
  providers: [
    AppService,
    UsersService,
    {
      provide: 'DATABASE',
      useFactory: () => drizzle(process.env.DATABASE_URL),
    },
  ],
})
export class AppModule {}
