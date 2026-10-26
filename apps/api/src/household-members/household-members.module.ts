import { Module } from '@nestjs/common';
import { HouseholdMembersService } from './household-members.service.js';

@Module({
  providers: [HouseholdMembersService],
  exports: [HouseholdMembersService],
})
export class HouseholdMembersModule {}
