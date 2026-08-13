# Database Seeders

This directory contains database seeders for populating the Quikr Clone application with mock data for development and testing purposes.

## Overview

The seeders populate the database with realistic data including:
- 50+ major Indian cities with 5-10 areas each
- Complete category hierarchy (Parent → Sub-category → Leaf)
- 10 users (5 buyers + 5 sellers)
- 35-50 ads with realistic titles, descriptions, and prices
- 70-200 placeholder images for ads

## Prerequisites

Before running seeders, ensure:
1. Database is created and accessible
2. Environment variables are configured in `.env` file
3. Database migrations have been run: `npm run migration:run`

## Running Seeders

### Run All Seeders (Recommended)

To seed the entire database with all data in the correct order:

```bash
npm run seed
```

This will execute all seeders in the following order:
1. Cities and Areas
2. Categories
3. Users
4. Ads
5. Images

### Run Individual Seeders

You can also run individual seeders if needed:

```bash
# Seed cities and areas only
npm run seed:cities

# Seed categories only
npm run seed:categories

# Seed users only
npm run seed:users

# Seed ads only (requires cities, categories, and users to be seeded first)
npm run seed:ads

# Seed images only (requires ads to be seeded first)
npm run seed:images
```

## Seeder Details

### 1. Cities and Areas Seeder (`cities-areas.seeder.ts`)

Seeds 50+ major Indian cities with their states and 5-10 areas per city.

**Sample cities:** Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, etc.

**Duplicate prevention:** Checks if city and area already exist before inserting.

### 2. Categories Seeder (`categories.seeder.ts`)

Seeds the three-level category hierarchy:

**Parent Categories:**
- QuikrBazar (Electronics, Furniture, Fashion, Home and Lifestyle)
- QuikrCars (Used Cars, New Cars)
- QuikrBikes (Motorcycles, Scooters, Bicycles)
- QuikrHomes (Properties for Sale, Properties for Rent, PG and Hostels)
- QuikrJobs (Full Time, Part Time, Freelance, Work From Home)
- QuikrServices (Home Services, Repair Services, Event Services)
- QuikrEducation (Tuitions, Classes, Courses)

**Duplicate prevention:** Checks if categories already exist before inserting.

### 3. Users Seeder (`users.seeder.ts`)

Seeds 10 users with hashed passwords:

**Buyer Users (5):**
- Email: `buyer1@example.com` to `buyer5@example.com`
- Password: `buyer@123` (hashed with bcrypt)

**Seller Users (5):**
- Email: `seller1@example.com` to `seller5@example.com`
- Password: `seller@123` (hashed with bcrypt)

**Duplicate prevention:** Checks if user email already exists before inserting.

### 4. Ads Seeder (`ads.seeder.ts`)

Seeds 7-10 ads per seller user with realistic data:

**Features:**
- Realistic titles and descriptions for different categories
- Random prices within appropriate ranges
- Random view counts (0-500)
- Random assignment to categories, cities, and areas
- All ads are active by default

**Total ads:** Approximately 35-50 ads

**Duplicate prevention:** Checks if similar ad already exists for the same user.

### 5. Images Seeder (`images.seeder.ts`)

Seeds 2-4 placeholder images per ad:

**Features:**
- Uses placeholder image URLs from picsum.photos
- Generates unique filenames for each image
- Maintains image order for each ad
- Stores image metadata (filename, path, URL)

**Total images:** Approximately 70-200 images

**Duplicate prevention:** Checks if images already exist for an ad before inserting.

### 6. Master Seeder (`master.seeder.ts`)

Orchestrates all seeders in the correct order with proper error handling and logging.

**Features:**
- Runs all seeders sequentially
- Handles database connection initialization and cleanup
- Provides detailed progress logging
- Ensures referential integrity by running seeders in dependency order

## Important Notes

### Duplicate Prevention

All seeders implement duplicate prevention to allow safe re-running:
- Cities/Areas: Checks by name and state/cityId
- Categories: Checks by slug and parent relationships
- Users: Checks by email
- Ads: Checks by title and userId
- Images: Checks by adId

This means you can run seeders multiple times without creating duplicate data.

### Foreign Key Dependencies

The seeders must be run in the correct order due to foreign key constraints:

```
Cities/Areas ─┐
Categories ───┼─→ Ads ─→ Images
Users ────────┘
```

The master seeder handles this automatically.

### Test Credentials

After seeding, you can login with these credentials:

**Buyer accounts:**
- Email: `buyer1@example.com` to `buyer5@example.com`
- Password: `buyer@123`

**Seller accounts:**
- Email: `seller1@example.com` to `seller5@example.com`
- Password: `seller@123`

### Resetting Data

To reset the database and re-seed:

```bash
# Revert all migrations (drops all tables)
npm run migration:revert

# Run migrations again
npm run migration:run

# Seed the database
npm run seed
```

## Troubleshooting

### "No cities found" error when seeding ads
Run the cities seeder first: `npm run seed:cities`

### "No categories found" error when seeding ads
Run the categories seeder first: `npm run seed:categories`

### "No seller users found" error when seeding ads
Run the users seeder first: `npm run seed:users`

### "No ads found" error when seeding images
Run the ads seeder first: `npm run seed:ads`

### Database connection errors
Check your `.env` file and ensure database credentials are correct.

### Permission errors
Ensure your database user has INSERT permissions on all tables.

## Development Tips

1. **Always run the master seeder** (`npm run seed`) for a complete setup
2. **Individual seeders are useful** for testing specific functionality
3. **Seeders are idempotent** - safe to run multiple times
4. **Check the console output** for detailed progress and any skipped records
5. **Use seeded data** for development and testing, not production

## Customization

To customize seeded data:

1. **Cities/Areas:** Edit the `citiesData` array in `cities-areas.seeder.ts`
2. **Categories:** Edit the `categoriesData` array in `categories.seeder.ts`
3. **Users:** Edit the `usersData` array in `users.seeder.ts`
4. **Ads:** Edit the `adTemplates` object in `ads.seeder.ts`
5. **Images:** Edit the `placeholderImageUrls` array in `images.seeder.ts`

After making changes, run the appropriate seeder to apply them.
