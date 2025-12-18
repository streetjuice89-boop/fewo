import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingsService: BookingsService
  ) {}

  /**
   * Get main dashboard KPIs
   */
  async getKPIs() {
    const [
      totalProperties,
      activeProperties,
      totalCustomers,
      bookingStats,
    ] = await Promise.all([
      this.prisma.property.count(),
      this.prisma.property.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: 'customer' } }),
      this.bookingsService.getStatistics(),
    ]);

    return {
      properties: {
        total: totalProperties,
        active: activeProperties,
      },
      customers: {
        total: totalCustomers,
      },
      bookings: bookingStats,
    };
  }

  /**
   * Get recent bookings for dashboard
   */
  async getRecentBookings(limit = 5) {
    const bookings = await this.prisma.booking.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        property: true,
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

    return bookings.map((b) => ({
      ...b,
      property: {
        ...b.property,
        images: JSON.parse(b.property.images),
      },
    }));
  }

  /**
   * Get bookings chart data
   */
  async getChartData(months = 6) {
    return this.bookingsService.getBookingsByMonth(months);
  }

  /**
   * Get top properties by bookings
   */
  async getTopProperties(limit = 5) {
    const properties = await this.prisma.property.findMany({
      take: limit,
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      include: {
        country: true,
        _count: {
          select: { bookings: true },
        },
      },
    });

    return properties.map((p) => ({
      ...p,
      images: JSON.parse(p.images),
      bookingCount: p._count.bookings,
    }));
  }

  /**
   * Get active chat sessions
   */
  async getActiveChatSessions() {
    return this.prisma.chatSession.count({
      where: { status: 'active' },
    });
  }
}

