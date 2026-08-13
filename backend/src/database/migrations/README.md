# Database Migrations

This directory contains TypeORM migrations for the Quikr Clone database schema.

## Migration Files

1. **1704000000001-CreateUsersTable.ts** - Creates the users table with authentication fields
2. **1704000000002-CreateParentCategoriesTable.ts** - Creates parent categories (QuikrBazar, QuikrCars, etc.)
3. **1704000000003-CreateSubCategoriesTable.ts** - Creates sub-categories with FK to parent categories
4. **1704000000004-CreateLeafCategoriesTable.ts** - Creates leaf categories with FK to sub-categories
5. **1704000000005-CreateCitiesTable.ts** - Creates cities table for location data
6. **1704000000006-CreateAreasTable.ts** - Creates areas table with FK to cities
7. **1704000000007-CreateAdsTable.ts** - Creates ads table with FKs and indexes
8. **1704000000008-CreateImagesTable.ts** - Creates images table with CASCADE delete

## Running Migrations

### Automatic (on application startup)
Migrations run automatically when the application starts due to `migrationsRun: true` in the TypeORM configuration.

### Manual via CLI

```bash
# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Generate a new migration based on entity changes
npm run migration:generate -- src/database/migrations/MigrationName
```

## Migration Order

Migrations must be run in the order specified by their timestamp prefixes to maintain referential integrity:

1. Users (no dependencies)
2. Parent Categories (no dependencies)
3. Sub Categories (depends on Parent Categories)
4. Leaf Categories (depends on Sub Categories)
5. Cities (no dependencies)
6. Areas (depends on Cities)
7. Ads (depends on Users, Leaf Categories, Cities, Areas)
8. Images (depends on Ads)

## Database Schema

### Foreign Key Relationships

- `sub_categories.parentId` → `parent_categories.id` (CASCADE)
- `leaf_categories.subCategoryId` → `sub_categories.id` (CASCADE)
- `areas.cityId` → `cities.id` (CASCADE)
- `ads.userId` → `users.id` (CASCADE)
- `ads.categoryId` → `leaf_categories.id` (RESTRICT)
- `ads.cityId` → `cities.id` (RESTRICT)
- `ads.areaId` → `areas.id` (RESTRICT)
- `images.adId` → `ads.id` (CASCADE)

### Indexes

The ads table includes indexes on:
- `categoryId` - For filtering by category
- `cityId` - For location-based filtering
- `areaId` - For area-specific filtering
- `isActive` - For filtering active/inactive ads
- `createdAt` - For sorting by date

## Notes

- All tables use UUID primary keys with `uuid_generate_v4()`
- The UUID extension is enabled in the first migration
- Timestamps use PostgreSQL's `CURRENT_TIMESTAMP`
- Soft deletes are implemented via the `isActive` boolean in the ads table
- CASCADE deletes are used for dependent data (images, category hierarchy)
- RESTRICT is used for ads to prevent accidental data loss
