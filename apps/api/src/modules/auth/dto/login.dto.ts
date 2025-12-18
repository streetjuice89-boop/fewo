import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'max@beispiel.de' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'sicheresPasswort123' })
  @IsString()
  password: string;
}

