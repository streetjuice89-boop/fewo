import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { AirbnbParserService } from './airbnb-parser.service';
import { ImportAirbnbDto } from './dto/import-airbnb.dto';

@Injectable()
export class AirbnbService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: AirbnbParserService
  ) {}

  /**
   * Import a new Airbnb listing
   */
  async import(importDto: ImportAirbnbDto, countryId: string) {
    const { url } = importDto;

    // Parse the listing
    const parsed = await this.parser.fetchAndParse(url);

    // Check if already imported
    const existing = await this.prisma.airbnbImport.findUnique({
      where: { airbnbId: parsed.airbnbId },
    });

    if (existing) {
      throw new ConflictException('This listing has already been imported');
    }

    // Create import record and property in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create Airbnb import record
      const airbnbImport = await tx.airbnbImport.create({
        data: {
          airbnbUrl: url,
          airbnbId: parsed.airbnbId,
          rawData: JSON.stringify(parsed.rawData),
          syncStatus: 'synced',
          lastSynced: new Date(),
        },
      });

      // Create property from parsed data
      const property = await tx.property.create({
        data: {
          titleDe: parsed.title,
          titleEn: parsed.title, // Would need translation in production
          descriptionDe: parsed.description,
          descriptionEn: parsed.description, // Would need translation in production
          countryId,
          address: parsed.address,
          pricePerNight: parsed.pricePerNight,
          maxGuests: parsed.maxGuests,
          bedrooms: parsed.bedrooms,
          bathrooms: parsed.bathrooms,
          amenities: JSON.stringify(parsed.amenities),
          images: JSON.stringify(parsed.images),
          isActive: true,
          airbnbImportId: airbnbImport.id,
        },
        include: {
          country: true,
        },
      });

      return { airbnbImport, property };
    });

    return {
      ...result,
      property: {
        ...result.property,
        amenities: JSON.parse(result.property.amenities),
        images: JSON.parse(result.property.images),
      },
    };
  }

  /**
   * Get all imports with pagination
   */
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [imports, total] = await Promise.all([
      this.prisma.airbnbImport.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            include: { country: true },
          },
        },
      }),
      this.prisma.airbnbImport.count(),
    ]);

    return {
      data: imports.map((imp) => ({
        ...imp,
        rawData: JSON.parse(imp.rawData),
        property: imp.property
          ? {
              ...imp.property,
              amenities: JSON.parse(imp.property.amenities),
              images: JSON.parse(imp.property.images),
            }
          : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get import by ID
   */
  async findById(id: string) {
    const airbnbImport = await this.prisma.airbnbImport.findUnique({
      where: { id },
      include: {
        property: {
          include: { country: true },
        },
      },
    });

    if (!airbnbImport) {
      throw new NotFoundException('Import not found');
    }

    return {
      ...airbnbImport,
      rawData: JSON.parse(airbnbImport.rawData),
      property: airbnbImport.property
        ? {
            ...airbnbImport.property,
            amenities: JSON.parse(airbnbImport.property.amenities),
            images: JSON.parse(airbnbImport.property.images),
          }
        : null,
    };
  }

  /**
   * Sync a single import (update data from source)
   */
  async sync(id: string) {
    const airbnbImport = await this.findById(id);

    try {
      // Re-fetch data
      const parsed = await this.parser.fetchAndParse(airbnbImport.airbnbUrl);

      // Update import record
      await this.prisma.airbnbImport.update({
        where: { id },
        data: {
          rawData: JSON.stringify(parsed.rawData),
          lastSynced: new Date(),
          syncStatus: 'synced',
        },
      });

      // Update property if exists
      if (airbnbImport.property) {
        await this.prisma.property.update({
          where: { id: airbnbImport.property.id },
          data: {
            pricePerNight: parsed.pricePerNight,
            // Only update price as other fields might have been customized
          },
        });
      }

      return { success: true, message: 'Sync completed' };
    } catch (error) {
      // Mark as failed
      await this.prisma.airbnbImport.update({
        where: { id },
        data: { syncStatus: 'failed' },
      });

      throw error;
    }
  }

  /**
   * Delete an import (does not delete the property)
   */
  async delete(id: string) {
    const airbnbImport = await this.findById(id);

    // Remove airbnb reference from property
    if (airbnbImport.property) {
      await this.prisma.property.update({
        where: { id: airbnbImport.property.id },
        data: { airbnbImportId: null },
      });
    }

    await this.prisma.airbnbImport.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Scheduled sync job - runs daily at 3 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async scheduledSync() {
    console.log('Starting scheduled Airbnb sync...');

    const imports = await this.prisma.airbnbImport.findMany({
      where: { syncStatus: { not: 'failed' } },
    });

    for (const imp of imports) {
      try {
        await this.sync(imp.id);
        console.log(`Synced import ${imp.id}`);
      } catch (error) {
        console.error(`Failed to sync import ${imp.id}:`, error);
      }

      // Rate limiting - wait between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log('Scheduled Airbnb sync completed');
  }

  /**
   * Get sync statistics
   */
  async getStatistics() {
    const [total, synced, pending, failed] = await Promise.all([
      this.prisma.airbnbImport.count(),
      this.prisma.airbnbImport.count({ where: { syncStatus: 'synced' } }),
      this.prisma.airbnbImport.count({ where: { syncStatus: 'pending' } }),
      this.prisma.airbnbImport.count({ where: { syncStatus: 'failed' } }),
    ]);

    return { total, synced, pending, failed };
  }
}

