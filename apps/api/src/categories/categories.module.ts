import { Module } from '@nestjs/common';
import { HouseholdMembersModule } from '../household-members/household-members.module.js';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';

@Module({
  imports: [HouseholdMembersModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
