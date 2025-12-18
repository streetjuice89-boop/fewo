import { Module } from '@nestjs/common';
import { AirbnbService } from './airbnb.service';
import { AirbnbController } from './airbnb.controller';
import { AirbnbParserService } from './airbnb-parser.service';

@Module({
  controllers: [AirbnbController],
  providers: [AirbnbService, AirbnbParserService],
  exports: [AirbnbService],
})
export class AirbnbModule {}

