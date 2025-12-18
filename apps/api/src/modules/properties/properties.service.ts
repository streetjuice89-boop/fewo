import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilterDto } from './dto/property-filter.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new property
   */
  async create(createPropertyDto: CreatePropertyDto) {
    const { categoryIds, ...data } = createPropertyDto;

    return this.prisma.property.create({
      data: {
        ...data,
        amenities: JSON.stringify(data.amenities || []),
        images: JSON.stringify(data.images || []),
        categories: categoryIds
          ? {
              create: categoryIds.map((categoryId) => ({ categoryId })),
            }
          : undefined,
      },
      include: {
        country: true,
        categories: {
          include: { category: true },
        },
      },
    });
  }

  /**
   * Find all properties with filters
   */
  async findAll(filter: PropertyFilterDto) {
    const {
      countryId,
      categoryId,
      minPrice,
      maxPrice,
      minGuests,
      search,
      page = 1,
      limit = 12,
      isActive,
    } = filter;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true; // Default to active only
    }

    if (countryId) {
      where.countryId = countryId;
    }

    if (categoryId) {
      where.categories = {
        some: { categoryId },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerNight = {};
      if (minPrice !== undefined) {
        (where.pricePerNight as Record<string, number>).gte = minPrice;
      }
      if (maxPrice !== undefined) {
        (where.pricePerNight as Record<string, number>).lte = maxPrice;
      }
    }

    if (minGuests !== undefined) {
      where.maxGuests = { gte: minGuests };
    }

    if (search) {
      where.OR = [
        { titleDe: { contains: search } },
        { titleEn: { contains: search } },
        { descriptionDe: { contains: search } },
        { descriptionEn: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          country: true,
          categories: {
            include: { category: true },
          },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    // Parse JSON fields
    const parsedProperties = properties.map((p) => ({
      ...p,
      amenities: JSON.parse(p.amenities),
      images: JSON.parse(p.images),
      categories: p.categories.map((c) => c.category),
    }));

    return {
      data: parsedProperties,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find property by ID
   */
  async findById(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        country: true,
        categories: {
          include: { category: true },
        },
        bookings: {
          where: {
            status: { in: ['pending', 'confirmed'] },
            checkOut: { gte: new Date() },
          },
          select: {
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return {
      ...property,
      amenities: JSON.parse(property.amenities),
      images: JSON.parse(property.images),
      categories: property.categories.map((c) => c.category),
    };
  }

  /**
   * Update property
   */
  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    const property = await this.findById(id);
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const { categoryIds, ...data } = updatePropertyDto;

    // If categoryIds provided, update categories
    if (categoryIds !== undefined) {
      // Delete existing categories
      await this.prisma.propertyCategory.deleteMany({
        where: { propertyId: id },
      });

      // Create new categories
      if (categoryIds.length > 0) {
        await this.prisma.propertyCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            propertyId: id,
            categoryId,
          })),
        });
      }
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.amenities) {
      updateData.amenities = JSON.stringify(data.amenities);
    }
    if (data.images) {
      updateData.images = JSON.stringify(data.images);
    }

    return this.prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        country: true,
        categories: {
          include: { category: true },
        },
      },
    });
  }

  /**
   * Delete property
   */
  async delete(id: string) {
    const property = await this.findById(id);
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    await this.prisma.property.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Get featured properties
   */
  async getFeatured(limit = 6) {
    const properties = await this.prisma.property.findMany({
      where: { isActive: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        country: true,
        categories: {
          include: { category: true },
        },
      },
    });

    return properties.map((p) => ({
      ...p,
      amenities: JSON.parse(p.amenities),
      images: JSON.parse(p.images),
      categories: p.categories.map((c) => c.category),
    }));
  }

  /**
   * Check availability for a property
   */
  async checkAvailability(propertyId: string, checkIn: Date, checkOut: Date) {
    const conflictingBookings = await this.prisma.booking.count({
      where: {
        propertyId,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          {
            AND: [{ checkIn: { lte: checkIn } }, { checkOut: { gt: checkIn } }],
          },
          {
            AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gte: checkOut } }],
          },
          {
            AND: [{ checkIn: { gte: checkIn } }, { checkOut: { lte: checkOut } }],
          },
        ],
      },
    });

    return { available: conflictingBookings === 0 };
  }
}

