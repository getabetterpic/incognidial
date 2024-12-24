import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserRegistrationDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsPhoneNumber('US')
  phoneNumber!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(255)
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;
}
