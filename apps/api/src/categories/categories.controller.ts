import { Controller, Get, ParseEnumPipe, ParseUUIDPipe, Query } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators.js';
import { CategoriesService } from './categories.service.js';

enum CategoryTypeParam {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('householdId', new ParseUUIDPipe({ optional: true })) householdId?: string,
    @Query('type', new ParseEnumPipe(CategoryTypeParam, { optional: true }))
    type?: CategoryTypeParam,
  ) {
    return this.categories.list(user.id, householdId, type);
  }
}
