import { IsString, IsPhoneNumber, MaxLength, MinLength } from 'class-validator';

export class UserDisableDto {
  @IsString()
  @IsPhoneNumber('US')
  phoneNumber!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(255)
  password!: string;
}
