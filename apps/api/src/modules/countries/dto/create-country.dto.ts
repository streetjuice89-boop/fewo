import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryDto {
  @ApiProperty({ example: 'Spanien' })
  @IsString()
  nameDe: string;

  @ApiProperty({ example: 'Spain' })
  @IsString()
  nameEn: string;

  @ApiProperty({ example: 'ES' })
  @IsString()
  @Length(2, 2)
  code: string;

  @ApiProperty({ example: '🇪🇸' })
  @IsString()
  flagEmoji: string;
}

