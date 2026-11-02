import { SUPPORTED_CURRENCIES } from '@mon-foyer/shared';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsTimeZone, Length } from 'class-validator';

export class CreateHouseholdDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value))
  @IsString()
  @Length(2, 80, { message: 'Le nom du foyer doit contenir entre 2 et 80 caractères.' })
  name: string;

  @IsOptional()
  @IsIn(SUPPORTED_CURRENCIES, { message: `Devise non prise en charge (${SUPPORTED_CURRENCIES.join(', ')}).` })
  currency?: string;

  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}
