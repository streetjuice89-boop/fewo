import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AirbnbService } from './airbnb.service';
import { ImportAirbnbDto } from './dto/import-airbnb.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('airbnb')
@Controller('airbnb')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AirbnbController {
  constructor(private readonly airbnbService: AirbnbService) {}

  @Post('import')
  @ApiOperation({ summary: 'Import an Airbnb listing' })
  async import(
    @Body() importDto: ImportAirbnbDto,
    @Query('countryId') countryId: string
  ) {
    return this.airbnbService.import(importDto, countryId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all imports' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.airbnbService.findAll(page, limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get import statistics' })
  async getStatistics() {
    return this.airbnbService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get import by ID' })
  async findOne(@Param('id') id: string) {
    return this.airbnbService.findById(id);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Sync an import' })
  async sync(@Param('id') id: string) {
    return this.airbnbService.sync(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an import' })
  async remove(@Param('id') id: string) {
    return this.airbnbService.delete(id);
  }
}

