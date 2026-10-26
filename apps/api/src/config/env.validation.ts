import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsIn(['development', 'test', 'production'])
  NODE_ENV: 'development' | 'test' | 'production' = 'development';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  API_PORT = 3001;

  @Matches(/^postgres(ql)?:\/\//, { message: 'DATABASE_URL doit être une URL PostgreSQL' })
  DATABASE_URL: string;

  @IsUrl({ require_tld: false })
  WEB_ORIGIN: string;

  @IsString()
  @MinLength(32, { message: 'BETTER_AUTH_SECRET doit contenir au moins 32 caractères' })
  BETTER_AUTH_SECRET: string;

  @IsUrl({ require_tld: false })
  BETTER_AUTH_URL: string;

  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/)
  DEFAULT_CURRENCY = 'MGA';

  @IsString()
  APP_TIMEZONE = 'Indian/Antananarivo';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24 * 30)
  INVITATION_TTL_HOURS = 72;
}

/** Fait échouer le démarrage si la configuration est invalide. */
export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`Configuration invalide :\n${details}`);
  }
  if (!isValidTimeZone(validated.APP_TIMEZONE)) {
    throw new Error(`Configuration invalide :\nAPP_TIMEZONE inconnu : ${validated.APP_TIMEZONE}`);
  }
  return validated;
}

function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('fr', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
