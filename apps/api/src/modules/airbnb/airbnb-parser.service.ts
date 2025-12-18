import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * Airbnb Parser Service
 * 
 * This is an abstracted parser service that can be replaced with actual
 * web scraping implementation. Currently uses mock data for development.
 * 
 * NOTE: Actual implementation should use appropriate scraping libraries
 * and respect rate limits and terms of service.
 */

export interface ParsedAirbnbListing {
  airbnbId: string;
  title: string;
  description: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  rating?: number;
  reviewCount?: number;
  hostName?: string;
  rawData: Record<string, unknown>;
}

@Injectable()
export class AirbnbParserService {
  /**
   * Extract Airbnb listing ID from URL
   */
  extractListingId(url: string): string {
    // Handle various Airbnb URL formats
    // https://www.airbnb.com/rooms/12345678
    // https://www.airbnb.de/rooms/12345678?guests=2&adults=2
    
    const patterns = [
      /airbnb\.[a-z]+\/rooms\/(\d+)/i,
      /airbnb\.[a-z]+\/h\/([a-zA-Z0-9-]+)/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    throw new BadRequestException('Invalid Airbnb URL format');
  }

  /**
   * Validate Airbnb URL
   */
  validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname.includes('airbnb');
    } catch {
      return false;
    }
  }

  /**
   * Fetch and parse Airbnb listing
   * 
   * NOTE: This is a mock implementation. In production, this would:
   * 1. Use a headless browser or API to fetch the listing
   * 2. Parse the HTML/JSON response
   * 3. Extract relevant data
   * 
   * For legal and ethical reasons, actual scraping is not implemented.
   * This should be replaced with an official API integration or
   * manual data entry system.
   */
  async fetchAndParse(url: string): Promise<ParsedAirbnbListing> {
    if (!this.validateUrl(url)) {
      throw new BadRequestException('Invalid Airbnb URL');
    }

    const airbnbId = this.extractListingId(url);

    // Mock implementation - returns sample data
    // In production, replace with actual scraping/API logic
    const mockData = this.getMockListingData(airbnbId, url);

    return mockData;
  }

  /**
   * Generate mock listing data for development
   */
  private getMockListingData(airbnbId: string, url: string): ParsedAirbnbListing {
    // Generate consistent but varied mock data based on ID
    const idNum = parseInt(airbnbId.replace(/\D/g, '')) || 12345;
    const priceVariation = (idNum % 300) + 50;
    const guestVariation = (idNum % 6) + 2;
    const bedroomVariation = (idNum % 4) + 1;

    return {
      airbnbId,
      title: `Imported Property ${airbnbId}`,
      description: `This is an imported listing from Airbnb (ID: ${airbnbId}). This description would be populated with the actual listing description in production. The property offers a wonderful vacation experience with all modern amenities.`,
      address: `Imported Address, City ${idNum % 100}`,
      pricePerNight: priceVariation,
      maxGuests: guestVariation,
      bedrooms: bedroomVariation,
      bathrooms: Math.max(1, Math.floor(bedroomVariation / 2)),
      amenities: this.getRandomAmenities(idNum),
      images: [
        `https://images.unsplash.com/photo-${1500000000000 + idNum}?w=800`,
        `https://images.unsplash.com/photo-${1500000000001 + idNum}?w=800`,
      ],
      rating: 4 + (idNum % 10) / 10,
      reviewCount: idNum % 200,
      hostName: `Host ${idNum % 1000}`,
      rawData: {
        sourceUrl: url,
        importedAt: new Date().toISOString(),
        originalId: airbnbId,
        mock: true,
      },
    };
  }

  /**
   * Get random amenities based on ID for variation
   */
  private getRandomAmenities(seed: number): string[] {
    const allAmenities = [
      'wifi',
      'pool',
      'parking',
      'aircon',
      'kitchen',
      'washer',
      'dryer',
      'tv',
      'heating',
      'workspace',
      'bbq',
      'garden',
      'balcony',
      'sea-view',
      'mountain-view',
      'fireplace',
      'hot-tub',
      'gym',
    ];

    const count = 4 + (seed % 8);
    const shuffled = [...allAmenities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

