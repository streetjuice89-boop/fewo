import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: CreateCountryDto) {
    const existing = await this.prisma.country.findUnique({
      where: { code: createCountryDto.code },
    });

    if (existing) {
      throw new ConflictException('Country with this code already exists');
    }

    return this.prisma.country.create({
      data: createCountryDto,
    });
  }

  async findAll() {
    return this.prisma.country.findMany({
      orderBy: { nameDe: 'asc' },
      include: {
        _count: {
          select: { properties: true },
        },
      },
    });
  }

  async findById(id: string) {
    const country = await this.prisma.country.findUnique({
      where: { id },
      include: {
        _count: {
          select: { properties: true },
        },
      },
    });

    if (!country) {
      throw new NotFoundException('Country not found');
    }

    return country;
  }

  async update(id: string, updateCountryDto: UpdateCountryDto) {
    await this.findById(id);

    return this.prisma.country.update({
      where: { id },
      data: updateCountryDto,
    });
  }

  async delete(id: string) {
    await this.findById(id);

    // Check if country has properties
    const propertyCount = await this.prisma.property.count({
      where: { countryId: id },
    });

    if (propertyCount > 0) {
      throw new ConflictException('Cannot delete country with existing properties');
    }

    await this.prisma.country.delete({ where: { id } });
    return { success: true };
  }
}

