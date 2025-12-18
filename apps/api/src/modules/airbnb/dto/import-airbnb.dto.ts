import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportAirbnbDto {
  @ApiProperty({ example: 'https://www.airbnb.com/rooms/12345678' })
  @IsUrl()
  url: string;
}

