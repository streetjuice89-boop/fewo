import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Strandnähe' })
  @IsString()
  nameDe: string;

  @ApiProperty({ example: 'Beach' })
  @IsString()
  nameEn: string;

  @ApiProperty({ example: 'beach' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @ApiProperty({ example: 'umbrella-beach' })
  @IsString()
  icon: string;
}

