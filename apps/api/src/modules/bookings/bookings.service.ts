import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PropertiesService } from '../properties/properties.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly propertiesService: PropertiesService
  ) {}

  /**
   * Create a new booking
   */
  async create(userId: string, createBookingDto: CreateBookingDto) {
    const { propertyId, checkIn, checkOut, guests, notes } = createBookingDto;

    // Get property
    const property = await this.propertiesService.findById(propertyId);
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (!property.isActive) {
      throw new BadRequestException('Property is not available');
    }

    // Check guest count
    if (guests > property.maxGuests) {
      throw new BadRequestException(
        `Maximum ${property.maxGuests} guests allowed for this property`
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-out must be after check-in');
    }

    if (checkInDate < new Date()) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    // Check availability
    const { available } = await this.propertiesService.checkAvailability(
      propertyId,
      checkInDate,
      checkOutDate
    );

    if (!available) {
      throw new BadRequestException('Property is not available for the selected dates');
    }

    // Calculate total price
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = property.pricePerNight * nights;

    return this.prisma.booking.create({
      data: {
        userId,
        propertyId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice,
        status: 'pending',
        notes,
      },
      include: {
        property: {
          include: { country: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Find all bookings with filters
   */
  async findAll(filter: BookingFilterDto) {
    const { status, userId, propertyId, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }
    if (propertyId) {
      where.propertyId = propertyId;
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            include: { country: true },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    // Parse property JSON fields
    const parsedBookings = bookings.map((b) => ({
      ...b,
      property: {
        ...b.property,
        images: JSON.parse(b.property.images),
        amenities: JSON.parse(b.property.amenities),
      },
    }));

    return {
      data: parsedBookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find bookings for a user
   */
  async findByUser(userId: string, page = 1, limit = 10) {
    return this.findAll({ userId, page, limit });
  }

  /**
   * Find booking by ID
   */
  async findById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          include: { country: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return {
      ...booking,
      property: {
        ...booking.property,
        images: JSON.parse(booking.property.images),
        amenities: JSON.parse(booking.property.amenities),
      },
    };
  }

  /**
   * Update booking status
   */
  async update(id: string, updateBookingDto: UpdateBookingDto, userId?: string, isAdmin = false) {
    const booking = await this.findById(id);

    // Check permissions
    if (!isAdmin && booking.userId !== userId) {
      throw new ForbiddenException('You can only modify your own bookings');
    }

    // Customers can only cancel pending bookings
    if (!isAdmin && updateBookingDto.status && updateBookingDto.status !== 'cancelled') {
      throw new ForbiddenException('You can only cancel bookings');
    }

    if (!isAdmin && updateBookingDto.status === 'cancelled' && booking.status !== 'pending') {
      throw new BadRequestException('Only pending bookings can be cancelled');
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        property: {
          include: { country: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Delete booking (admin only)
   */
  async delete(id: string) {
    await this.findById(id);
    await this.prisma.booking.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Get booking statistics
   */
  async getStatistics() {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      thisMonthBookings,
      lastMonthBookings,
      totalRevenue,
      thisMonthRevenue,
    ] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'pending' } }),
      this.prisma.booking.count({ where: { status: 'confirmed' } }),
      this.prisma.booking.count({ where: { createdAt: { gte: thisMonth } } }),
      this.prisma.booking.count({
        where: { createdAt: { gte: lastMonth, lt: thisMonth } },
      }),
      this.prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ['confirmed', 'completed'] } },
      }),
      this.prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          status: { in: ['confirmed', 'completed'] },
          createdAt: { gte: thisMonth },
        },
      }),
    ]);

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      thisMonthBookings,
      lastMonthBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      thisMonthRevenue: thisMonthRevenue._sum.totalPrice || 0,
    };
  }

  /**
   * Get bookings grouped by month for charts
   */
  async getBookingsByMonth(months = 12) {
    const result: { month: string; count: number; revenue: number }[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const [bookings, revenue] = await Promise.all([
        this.prisma.booking.count({
          where: {
            createdAt: { gte: startDate, lt: endDate },
          },
        }),
        this.prisma.booking.aggregate({
          _sum: { totalPrice: true },
          where: {
            status: { in: ['confirmed', 'completed'] },
            createdAt: { gte: startDate, lt: endDate },
          },
        }),
      ]);

      result.push({
        month: startDate.toISOString().slice(0, 7),
        count: bookings,
        revenue: revenue._sum.totalPrice || 0,
      });
    }

    return result;
  }
}

