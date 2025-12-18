import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  async getKPIs() {
    return this.dashboardService.getKPIs();
  }

  @Get('recent-bookings')
  @ApiOperation({ summary: 'Get recent bookings' })
  async getRecentBookings(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentBookings(limit);
  }

  @Get('chart-data')
  @ApiOperation({ summary: 'Get chart data' })
  async getChartData(@Query('months') months?: number) {
    return this.dashboardService.getChartData(months);
  }

  @Get('top-properties')
  @ApiOperation({ summary: 'Get top properties' })
  async getTopProperties(@Query('limit') limit?: number) {
    return this.dashboardService.getTopProperties(limit);
  }

  @Get('active-chats')
  @ApiOperation({ summary: 'Get active chat sessions count' })
  async getActiveChats() {
    return { count: await this.dashboardService.getActiveChatSessions() };
  }
}

