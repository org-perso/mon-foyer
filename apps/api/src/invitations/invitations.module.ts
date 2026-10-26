import { Module } from '@nestjs/common';
import { HouseholdMembersModule } from '../household-members/household-members.module.js';
import { InvitationsController } from './invitations.controller.js';
import { InvitationsService } from './invitations.service.js';

@Module({
  imports: [HouseholdMembersModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
