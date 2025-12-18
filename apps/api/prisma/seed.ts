import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@voyagenest.com' },
    update: {},
    create: {
      email: 'admin@voyagenest.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'VoyageNest',
      role: 'admin',
      customerScore: 100,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Test Customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'kunde@test.de' },
    update: {},
    create: {
      email: 'kunde@test.de',
      passwordHash: customerPassword,
      firstName: 'Max',
      lastName: 'Mustermann',
      phone: '+49 170 1234567',
      role: 'customer',
      customerScore: 50,
    },
  });
  console.log('✅ Test customer created:', customer.email);

  // Create Countries
  const countries = await Promise.all([
    prisma.country.upsert({
      where: { code: 'DE' },
      update: {},
      create: { nameDe: 'Deutschland', nameEn: 'Germany', code: 'DE', flagEmoji: '🇩🇪' },
    }),
    prisma.country.upsert({
      where: { code: 'ES' },
      update: {},
      create: { nameDe: 'Spanien', nameEn: 'Spain', code: 'ES', flagEmoji: '🇪🇸' },
    }),
    prisma.country.upsert({
      where: { code: 'IT' },
      update: {},
      create: { nameDe: 'Italien', nameEn: 'Italy', code: 'IT', flagEmoji: '🇮🇹' },
    }),
    prisma.country.upsert({
      where: { code: 'GR' },
      update: {},
      create: { nameDe: 'Griechenland', nameEn: 'Greece', code: 'GR', flagEmoji: '🇬🇷' },
    }),
    prisma.country.upsert({
      where: { code: 'PT' },
      update: {},
      create: { nameDe: 'Portugal', nameEn: 'Portugal', code: 'PT', flagEmoji: '🇵🇹' },
    }),
    prisma.country.upsert({
      where: { code: 'FR' },
      update: {},
      create: { nameDe: 'Frankreich', nameEn: 'France', code: 'FR', flagEmoji: '🇫🇷' },
    }),
    prisma.country.upsert({
      where: { code: 'HR' },
      update: {},
      create: { nameDe: 'Kroatien', nameEn: 'Croatia', code: 'HR', flagEmoji: '🇭🇷' },
    }),
    prisma.country.upsert({
      where: { code: 'AT' },
      update: {},
      create: { nameDe: 'Österreich', nameEn: 'Austria', code: 'AT', flagEmoji: '🇦🇹' },
    }),
  ]);
  console.log('✅ Countries created:', countries.length);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'beach' },
      update: {},
      create: { nameDe: 'Strandnähe', nameEn: 'Beach', slug: 'beach', icon: 'umbrella-beach' },
    }),
    prisma.category.upsert({
      where: { slug: 'mountain' },
      update: {},
      create: { nameDe: 'Berge', nameEn: 'Mountains', slug: 'mountain', icon: 'mountain' },
    }),
    prisma.category.upsert({
      where: { slug: 'city' },
      update: {},
      create: { nameDe: 'Stadt', nameEn: 'City', slug: 'city', icon: 'building' },
    }),
    prisma.category.upsert({
      where: { slug: 'pool' },
      update: {},
      create: { nameDe: 'Mit Pool', nameEn: 'With Pool', slug: 'pool', icon: 'swimming-pool' },
    }),
    prisma.category.upsert({
      where: { slug: 'luxury' },
      update: {},
      create: { nameDe: 'Luxus', nameEn: 'Luxury', slug: 'luxury', icon: 'gem' },
    }),
    prisma.category.upsert({
      where: { slug: 'family' },
      update: {},
      create: { nameDe: 'Familienfreundlich', nameEn: 'Family Friendly', slug: 'family', icon: 'users' },
    }),
    prisma.category.upsert({
      where: { slug: 'romantic' },
      update: {},
      create: { nameDe: 'Romantisch', nameEn: 'Romantic', slug: 'romantic', icon: 'heart' },
    }),
    prisma.category.upsert({
      where: { slug: 'countryside' },
      update: {},
      create: { nameDe: 'Landhaus', nameEn: 'Countryside', slug: 'countryside', icon: 'tree' },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Get Spain for sample properties
  const spain = countries.find(c => c.code === 'ES')!;
  const italy = countries.find(c => c.code === 'IT')!;
  const greece = countries.find(c => c.code === 'GR')!;
  const croatia = countries.find(c => c.code === 'HR')!;

  // Get categories
  const beachCat = categories.find(c => c.slug === 'beach')!;
  const poolCat = categories.find(c => c.slug === 'pool')!;
  const luxuryCat = categories.find(c => c.slug === 'luxury')!;
  const familyCat = categories.find(c => c.slug === 'family')!;
  const romanticCat = categories.find(c => c.slug === 'romantic')!;

  // Create Sample Properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        titleDe: 'Luxuriöse Villa am Meer - Mallorca',
        titleEn: 'Luxury Beachfront Villa - Mallorca',
        descriptionDe: 'Erleben Sie puren Luxus in dieser atemberaubenden Villa direkt am Strand von Mallorca. Mit privatem Pool, 4 Schlafzimmern und einem spektakulären Meerblick bietet diese Unterkunft alles für einen unvergesslichen Urlaub.',
        descriptionEn: 'Experience pure luxury in this stunning beachfront villa in Mallorca. With a private pool, 4 bedrooms, and spectacular sea views, this property offers everything for an unforgettable vacation.',
        countryId: spain.id,
        address: 'Carrer de la Marina 45, Port de Sóller, Mallorca',
        pricePerNight: 450,
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        amenities: JSON.stringify(['wifi', 'pool', 'parking', 'aircon', 'kitchen', 'washer', 'bbq', 'sea-view']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        ]),
        isActive: true,
        categories: {
          create: [
            { categoryId: beachCat.id },
            { categoryId: poolCat.id },
            { categoryId: luxuryCat.id },
          ],
        },
      },
    }),
    prisma.property.create({
      data: {
        titleDe: 'Gemütliches Apartment in Barcelona',
        titleEn: 'Cozy Apartment in Barcelona',
        descriptionDe: 'Modernes Apartment im Herzen von Barcelona, nur wenige Gehminuten von La Rambla und dem gotischen Viertel entfernt. Perfekt für Städtereisen.',
        descriptionEn: 'Modern apartment in the heart of Barcelona, just a short walk from La Rambla and the Gothic Quarter. Perfect for city breaks.',
        countryId: spain.id,
        address: 'Carrer de Ferran 28, Barcelona',
        pricePerNight: 120,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: JSON.stringify(['wifi', 'aircon', 'kitchen', 'washer', 'balcony']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        ]),
        isActive: true,
      },
    }),
    prisma.property.create({
      data: {
        titleDe: 'Romantische Trulli in Alberobello',
        titleEn: 'Romantic Trulli in Alberobello',
        descriptionDe: 'Authentische Trulli-Unterkunft in der malerischen Stadt Alberobello, UNESCO-Weltkulturerbe. Ein einzigartiges Erlebnis in Süditalien.',
        descriptionEn: 'Authentic Trulli accommodation in the picturesque town of Alberobello, a UNESCO World Heritage site. A unique experience in Southern Italy.',
        countryId: italy.id,
        address: 'Via Monte Nero 15, Alberobello, Puglia',
        pricePerNight: 180,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: JSON.stringify(['wifi', 'kitchen', 'garden', 'parking']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=800',
          'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800',
        ]),
        isActive: true,
        categories: {
          create: [
            { categoryId: romanticCat.id },
          ],
        },
      },
    }),
    prisma.property.create({
      data: {
        titleDe: 'Weiße Villa in Santorini mit Caldera-Blick',
        titleEn: 'White Villa in Santorini with Caldera View',
        descriptionDe: 'Traumhafte Villa in Oia mit spektakulärem Blick auf die Caldera. Genießen Sie jeden Tag den berühmten Santorini-Sonnenuntergang von Ihrer privaten Terrasse.',
        descriptionEn: 'Dreamy villa in Oia with spectacular Caldera views. Enjoy the famous Santorini sunset from your private terrace every day.',
        countryId: greece.id,
        address: 'Oia Main Street, Santorini',
        pricePerNight: 380,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: JSON.stringify(['wifi', 'pool', 'aircon', 'kitchen', 'terrace', 'sea-view', 'jacuzzi']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
          'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
        ]),
        isActive: true,
        categories: {
          create: [
            { categoryId: luxuryCat.id },
            { categoryId: romanticCat.id },
            { categoryId: poolCat.id },
          ],
        },
      },
    }),
    prisma.property.create({
      data: {
        titleDe: 'Familienfreundliches Strandhaus in Dubrovnik',
        titleEn: 'Family-Friendly Beach House in Dubrovnik',
        descriptionDe: 'Geräumiges Strandhaus perfekt für Familien, nur 100m vom kristallklaren Wasser der Adria entfernt. Ideal gelegen für Ausflüge in die Altstadt von Dubrovnik.',
        descriptionEn: 'Spacious beach house perfect for families, just 100m from the crystal-clear Adriatic waters. Ideally located for trips to Dubrovnik Old Town.',
        countryId: croatia.id,
        address: 'Uvala Lapad 22, Dubrovnik',
        pricePerNight: 220,
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 2,
        amenities: JSON.stringify(['wifi', 'parking', 'aircon', 'kitchen', 'washer', 'garden', 'bbq', 'beach-access']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        ]),
        isActive: true,
        categories: {
          create: [
            { categoryId: beachCat.id },
            { categoryId: familyCat.id },
          ],
        },
      },
    }),
  ]);
  console.log('✅ Properties created:', properties.length);

  // Create Sample Booking
  const booking = await prisma.booking.create({
    data: {
      userId: customer.id,
      propertyId: properties[0].id,
      checkIn: new Date('2024-07-15'),
      checkOut: new Date('2024-07-22'),
      guests: 4,
      totalPrice: 450 * 7,
      status: 'confirmed',
      notes: 'Späte Ankunft gegen 20:00 Uhr geplant.',
    },
  });
  console.log('✅ Sample booking created:', booking.id);

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Admin Login: admin@voyagenest.com / admin123');
  console.log('📧 Customer Login: kunde@test.de / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

