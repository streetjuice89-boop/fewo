import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Luxuriöse Villa am Meer' })
  @IsString()
  @MinLength(5)
  titleDe: string;

  @ApiProperty({ example: 'Luxury Beachfront Villa' })
  @IsString()
  @MinLength(5)
  titleEn: string;

  @ApiProperty({ example: 'Wunderschöne Villa mit Meerblick...' })
  @IsString()
  @MinLength(20)
  descriptionDe: string;

  @ApiProperty({ example: 'Beautiful villa with sea view...' })
  @IsString()
  @MinLength(20)
  descriptionEn: string;

  @ApiProperty({ example: 'clxyz123' })
  @IsString()
  countryId: string;

  @ApiProperty({ example: 'Strandweg 42, 12345 Küstenstadt' })
  @IsString()
  address: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(1)
  pricePerNight: number;

  @ApiProperty({ example: 6 })
  @IsNumber()
  @Min(1)
  maxGuests: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  bedrooms: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  bathrooms: number;

  @ApiPropertyOptional({ example: ['wifi', 'pool', 'parking'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ example: ['https://example.com/image1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: ['catId1', 'catId2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

