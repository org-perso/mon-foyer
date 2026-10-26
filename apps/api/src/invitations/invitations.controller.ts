import { Body, Controller, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators.js';
import { AcceptInvitationDto, CreateInvitationDto } from './dto/invitation.dto.js';
import { InvitationsService } from './invitations.service.js';

// Limites renforcées : création et acceptation d'invitations
@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Controller()
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Post('households/:householdId/invitations')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('householdId', ParseUUIDPipe) householdId: string,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitations.create(user.id, householdId, dto);
  }

  @Post('invitations/accept')
  @HttpCode(200)
  accept(@CurrentUser() user: AuthenticatedUser, @Body() dto: AcceptInvitationDto) {
    return this.invitations.accept(user, dto.token);
  }
}
