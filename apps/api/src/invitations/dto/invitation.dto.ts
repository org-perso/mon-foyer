import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';

export class CreateInvitationDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email?: string;

  // OWNER n'est jamais attribuable par invitation
  @IsOptional()
  @IsIn(['ADMIN', 'MEMBER'])
  role?: 'ADMIN' | 'MEMBER';
}

export class AcceptInvitationDto {
  @IsString()
  @Length(43, 43) // 32 octets en base64url
  token: string;
}
