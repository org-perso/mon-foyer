import { Controller, Get, ParseUUIDPipe, Query } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators.js';
import { ReportsService } from './reports.service.js';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('monthly')
  monthly(
    @CurrentUser() user: AuthenticatedUser,
    @Query('householdId', new ParseUUIDPipe({ optional: true })) householdId?: string,
    @Query('month') month?: string,
  ) {
    return this.reports.monthlySummary(user.id, householdId, month);
  }
}
