import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators.js';
import { HouseholdMembersService } from '../household-members/household-members.service.js';
import { CreateHouseholdDto } from './dto/create-household.dto.js';
import { HouseholdsService } from './households.service.js';

@Controller('households')
export class HouseholdsController {
  constructor(
    private readonly households: HouseholdsService,
    private readonly members: HouseholdMembersService,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateHouseholdDto) {
    return this.households.create(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.households.listForUser(user.id);
  }

  @Get(':householdId')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('householdId', ParseUUIDPipe) householdId: string,
  ) {
    return this.households.findOne(user.id, householdId);
  }

  @Get(':householdId/members')
  listMembers(
    @CurrentUser() user: AuthenticatedUser,
    @Param('householdId', ParseUUIDPipe) householdId: string,
  ) {
    return this.members.listMembers(user.id, householdId);
  }
}
