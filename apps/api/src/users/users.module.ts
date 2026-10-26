import { Module } from '@nestjs/common';
import { UserSyncService } from './user-sync.service.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserSyncService],
  exports: [UserSyncService],
})
export class UsersModule {}
