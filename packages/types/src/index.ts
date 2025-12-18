// User Types
export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  customerScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'passwordHash'>;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

// Property Types
export interface Property {
  id: string;
  titleDe: string;
  titleEn: string;
  descriptionDe: string;
  descriptionEn: string;
  countryId: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  isActive: boolean;
  airbnbImportId?: string;
  createdAt: Date;
  updatedAt: Date;
  country?: Country;
  categories?: Category[];
}

export interface CreatePropertyDto {
  titleDe: string;
  titleEn: string;
  descriptionDe: string;
  descriptionEn: string;
  countryId: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  categoryIds?: string[];
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  isActive?: boolean;
}

export interface PropertyFilter {
  countryId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minGuests?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// Country Types
export interface Country {
  id: string;
  nameDe: string;
  nameEn: string;
  code: string;
  flagEmoji: string;
}

export interface CreateCountryDto {
  nameDe: string;
  nameEn: string;
  code: string;
  flagEmoji: string;
}

// Category Types
export interface Category {
  id: string;
  nameDe: string;
  nameEn: string;
  slug: string;
  icon: string;
}

export interface CreateCategoryDto {
  nameDe: string;
  nameEn: string;
  slug: string;
  icon: string;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  property?: Property;
}

export interface CreateBookingDto {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes?: string;
}

export interface UpdateBookingDto {
  status?: BookingStatus;
  notes?: string;
}

// Chat Types
export type ChatSessionStatus = 'active' | 'closed';

export interface ChatSession {
  id: string;
  userId?: string;
  adminId?: string;
  status: ChatSessionStatus;
  isBot: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId?: string;
  content: string;
  isBot: boolean;
  createdAt: Date;
}

export interface SendMessageDto {
  sessionId: string;
  content: string;
}

// Airbnb Import Types
export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface AirbnbImport {
  id: string;
  airbnbUrl: string;
  airbnbId: string;
  rawData: Record<string, unknown>;
  lastSynced?: Date;
  syncStatus: SyncStatus;
  createdAt: Date;
  property?: Property;
}

export interface ImportAirbnbDto {
  url: string;
}

// System Log Types
export interface SystemLog {
  id: string;
  userId?: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// Dashboard Types
export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProperties: number;
  recentBookings: Booking[];
  bookingsByMonth: { month: string; count: number; revenue: number }[];
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Locale Types
export type Locale = 'de' | 'en';

export interface LocalizedString {
  de: string;
  en: string;
}

