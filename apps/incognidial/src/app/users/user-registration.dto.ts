import { IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class UserRegistrationDto {
  @IsString()
  @IsPhoneNumber('US')
  phoneNumber!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(255)
  password!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(255)
  passwordConfirmation!: string;
}
