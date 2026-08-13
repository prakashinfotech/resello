import { AppDataSource } from '../data-source';
import { seedCitiesAndAreas } from './cities-areas.seeder';
import { seedCategories } from './categories.seeder';
import { seedUsers } from './users.seeder';
import { seedAds } from './ads.seeder';
import { seedImages } from './images.seeder';

/**
 * Master seeder that runs all seeders in the correct order
 * Order is important due to foreign key dependencies:
 * 1. Cities and Areas (no dependencies)
 * 2. Categories (no dependencies)
 * 3. Users (no dependencies)
 * 4. Ads (depends on Users, Categories, Cities, Areas)
 * 5. Images (depends on Ads)
 */
export async function runAllSeeders() {
  try {
    console.log('='.repeat(60));
    console.log('Starting Master Seeder');
    console.log('='.repeat(60));

    // Initialize data source if not already initialized
    if (!AppDataSource.isInitialized) {
      console.log('Initializing database connection...');
      await AppDataSource.initialize();
      console.log('Database connection established.');
    }

    // 1. Seed Cities and Areas
    console.log('\n' + '-'.repeat(60));
    console.log('Step 1/5: Seeding Cities and Areas');
    console.log('-'.repeat(60));
    await seedCitiesAndAreas();

    // 2. Seed Categories
    console.log('\n' + '-'.repeat(60));
    console.log('Step 2/5: Seeding Categories');
    console.log('-'.repeat(60));
    await seedCategories();

    // 3. Seed Users
    console.log('\n' + '-'.repeat(60));
    console.log('Step 3/5: Seeding Users');
    console.log('-'.repeat(60));
    await seedUsers();

    // 4. Seed Ads
    console.log('\n' + '-'.repeat(60));
    console.log('Step 4/5: Seeding Ads');
    console.log('-'.repeat(60));
    await seedAds();

    // 5. Seed Images
    console.log('\n' + '-'.repeat(60));
    console.log('Step 5/5: Seeding Images');
    console.log('-'.repeat(60));
    await seedImages();

    console.log('\n' + '='.repeat(60));
    console.log('Master Seeder Completed Successfully!');
    console.log('='.repeat(60));
    console.log('\nDatabase has been seeded with:');
    console.log('  ✓ 50+ cities with areas');
    console.log('  ✓ Complete category hierarchy (Parent → Sub → Leaf)');
    console.log('  ✓ 10 users (5 buyers + 5 sellers)');
    console.log('  ✓ 35-50 ads with realistic data');
    console.log('  ✓ 70-200 images for ads');
    console.log('\nYou can now start the application and test with seeded data.');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('Master Seeder Failed!');
    console.error('='.repeat(60));
    console.error('Error:', error);
    throw error;
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run master seeder if executed directly
if (require.main === module) {
  runAllSeeders()
    .then(() => {
      console.log('\nSeeding process completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nSeeding process failed:', error);
      process.exit(1);
    });
}
