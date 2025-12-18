import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'clxyz123' })
  @IsString()
  propertyId: string;

  @ApiProperty({ example: '2024-07-15' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2024-07-22' })
  @IsDateString()
  checkOut: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  guests: number;

  @ApiPropertyOptional({ example: 'Späte Ankunft gegen 20:00 Uhr' })
  @IsOptional()
  @IsString()
  notes?: string;
}

