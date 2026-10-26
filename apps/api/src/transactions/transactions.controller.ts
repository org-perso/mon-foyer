import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators.js';
import { ListTransactionsQuery } from './dto/list-transactions.query.js';
import { TransactionsService } from './transactions.service.js';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: ListTransactionsQuery) {
    return this.transactions.list(user.id, query);
  }
}
