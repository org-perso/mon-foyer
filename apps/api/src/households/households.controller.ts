import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators.js';
import { MAX_IMAGE_BYTES } from '../common/files/image-validation.js';
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

  /** multipart/form-data, champ « photo ». Fichier gardé en mémoire, jamais sur disque. */
  @Put(':householdId/photo')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } }))
  setPhoto(
    @CurrentUser() user: AuthenticatedUser,
    @Param('householdId', ParseUUIDPipe) householdId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException('Fichier « photo » manquant.');
    return this.households.setPhoto(user.id, householdId, file.buffer);
  }

  @Delete(':householdId/photo')
  removePhoto(
    @CurrentUser() user: AuthenticatedUser,
    @Param('householdId', ParseUUIDPipe) householdId: string,
  ) {
    return this.households.removePhoto(user.id, householdId);
  }
}
