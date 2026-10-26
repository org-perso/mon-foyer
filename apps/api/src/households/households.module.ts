import { Module } from '@nestjs/common';
import { HouseholdMembersModule } from '../household-members/household-members.module.js';
import { MediaModule } from '../media/media.module.js';
import { HouseholdsController } from './households.controller.js';
import { HouseholdsService } from './households.service.js';

@Module({
  imports: [HouseholdMembersModule, MediaModule],
  controllers: [HouseholdsController],
  providers: [HouseholdsService],
  exports: [HouseholdsService],
})
export class HouseholdsModule {}
