import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class UserLoginDto {
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
}
