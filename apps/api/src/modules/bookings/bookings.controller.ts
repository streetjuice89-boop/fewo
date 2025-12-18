import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createBookingDto: CreateBookingDto
  ) {
    return this.bookingsService.create(userId, createBookingDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all bookings (admin only)' })
  async findAll(@Query() filter: BookingFilterDto) {
    return this.bookingsService.findAll(filter);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get current user bookings' })
  async getMyBookings(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.bookingsService.findByUser(userId, page, limit);
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get booking statistics (admin only)' })
  async getStatistics() {
    return this.bookingsService.getStatistics();
  }

  @Get('by-month')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get bookings by month (admin only)' })
  async getByMonth(@Query('months') months?: number) {
    return this.bookingsService.getBookingsByMonth(months);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string
  ) {
    const booking = await this.bookingsService.findById(id);

    // Check if user can view this booking
    if (role !== 'admin' && booking.userId !== userId) {
      return { error: 'You can only view your own bookings' };
    }

    return booking;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update booking' })
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string
  ) {
    return this.bookingsService.update(
      id,
      updateBookingDto,
      userId,
      role === 'admin'
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete booking (admin only)' })
  async remove(@Param('id') id: string) {
    return this.bookingsService.delete(id);
  }
}

