import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsTimeZone, Length, Matches } from 'class-validator';

export class CreateHouseholdDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 80)
  name: string;

  @IsOptional()
  @Matches(/^[A-Z]{3}$/, { message: 'currency doit être un code ISO 4217 (ex. MGA)' })
  currency?: string;

  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}
