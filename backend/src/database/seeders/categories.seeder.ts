import { AppDataSource } from '../data-source';

interface LeafCategory {
  name: string;
  slug: string;
}

interface SubCategory {
  name: string;
  slug: string;
  leafCategories: LeafCategory[];
}

interface ParentCategory {
  name: string;
  slug: string;
  icon: string;
  subCategories: SubCategory[];
}

const categoriesData: ParentCategory[] = [
  {
    name: 'ReSelloBazar',
    slug: 'resello-bazar',
    icon: 'shopping-bag',
    subCategories: [
      {
        name: 'Electronics',
        slug: 'electronics',
        leafCategories: [
          { name: 'Mobile Phones', slug: 'mobile-phones' },
          { name: 'TV', slug: 'tv' },
          { name: 'Laptops', slug: 'laptops' },
          { name: 'Cameras', slug: 'cameras' },
          { name: 'Audio Systems', slug: 'audio-systems' },
        ],
      },
      {
        name: 'Furniture',
        slug: 'furniture',
        leafCategories: [
          { name: 'Sofa', slug: 'sofa' },
          { name: 'Bed', slug: 'bed' },
          { name: 'Table', slug: 'table' },
          { name: 'Chair', slug: 'chair' },
          { name: 'Wardrobe', slug: 'wardrobe' },
        ],
      },
      {
        name: 'Fashion',
        slug: 'fashion',
        leafCategories: [
          { name: "Men's Clothing", slug: 'mens-clothing' },
          { name: "Women's Clothing", slug: 'womens-clothing' },
          { name: 'Footwear', slug: 'footwear' },
          { name: 'Accessories', slug: 'accessories' },
        ],
      },
      {
        name: 'Home and Lifestyle',
        slug: 'home-and-lifestyle',
        leafCategories: [
          { name: 'Home Appliances', slug: 'home-appliances' },
          { name: 'Kitchen Items', slug: 'kitchen-items' },
          { name: 'Home Decor', slug: 'home-decor' },
          { name: 'Garden', slug: 'garden' },
        ],
      },
    ],
  },
  {
    name: 'ReSelloCars',
    slug: 'resello-cars',
    icon: 'car',
    subCategories: [
      {
        name: 'Used Cars',
        slug: 'used-cars',
        leafCategories: [
          { name: 'Sedan', slug: 'sedan' },
          { name: 'SUV', slug: 'suv' },
          { name: 'Hatchback', slug: 'hatchback' },
          { name: 'Luxury', slug: 'luxury' },
        ],
      },
      {
        name: 'New Cars',
        slug: 'new-cars',
        leafCategories: [
          { name: 'Sedan', slug: 'new-sedan' },
          { name: 'SUV', slug: 'new-suv' },
          { name: 'Hatchback', slug: 'new-hatchback' },
        ],
      },
    ],
  },
  {
    name: 'ReSelloBikes',
    slug: 'resello-bikes',
    icon: 'bike',
    subCategories: [
      {
        name: 'Motorcycles',
        slug: 'motorcycles',
        leafCategories: [
          { name: 'Sports Bikes', slug: 'sports-bikes' },
          { name: 'Cruiser', slug: 'cruiser' },
          { name: 'Commuter', slug: 'commuter' },
        ],
      },
      {
        name: 'Scooters',
        slug: 'scooters',
        leafCategories: [
          { name: 'Electric Scooters', slug: 'electric-scooters' },
          { name: 'Petrol Scooters', slug: 'petrol-scooters' },
        ],
      },
      {
        name: 'Bicycles',
        slug: 'bicycles',
        leafCategories: [
          { name: 'Mountain Bikes', slug: 'mountain-bikes' },
          { name: 'Road Bikes', slug: 'road-bikes' },
          { name: 'Hybrid Bikes', slug: 'hybrid-bikes' },
        ],
      },
    ],
  },
  {
    name: 'ReSelloHomes',
    slug: 'resello-homes',
    icon: 'home',
    subCategories: [
      {
        name: 'Properties for Sale',
        slug: 'properties-for-sale',
        leafCategories: [
          { name: 'Apartments', slug: 'apartments' },
          { name: 'Houses', slug: 'houses' },
          { name: 'Villas', slug: 'villas' },
          { name: 'Land', slug: 'land' },
        ],
      },
      {
        name: 'Properties for Rent',
        slug: 'properties-for-rent',
        leafCategories: [
          { name: '1 BHK', slug: '1-bhk' },
          { name: '2 BHK', slug: '2-bhk' },
          { name: '3 BHK', slug: '3-bhk' },
          { name: 'Commercial', slug: 'commercial' },
        ],
      },
      {
        name: 'PG and Hostels',
        slug: 'pg-and-hostels',
        leafCategories: [
          { name: 'PG for Men', slug: 'pg-for-men' },
          { name: 'PG for Women', slug: 'pg-for-women' },
          { name: 'Hostels', slug: 'hostels' },
        ],
      },
    ],
  },
  {
    name: 'ReSelloJobs',
    slug: 'resello-jobs',
    icon: 'briefcase',
    subCategories: [
      {
        name: 'Full Time',
        slug: 'full-time',
        leafCategories: [
          { name: 'IT Jobs', slug: 'it-jobs' },
          { name: 'Sales', slug: 'sales' },
          { name: 'Marketing', slug: 'marketing' },
          { name: 'Finance', slug: 'finance' },
          { name: 'Healthcare', slug: 'healthcare' },
        ],
      },
      {
        name: 'Part Time',
        slug: 'part-time',
        leafCategories: [
          { name: 'Retail', slug: 'retail' },
          { name: 'Hospitality', slug: 'hospitality' },
          { name: 'Teaching', slug: 'teaching' },
        ],
      },
      {
        name: 'Freelance',
        slug: 'freelance',
        leafCategories: [
          { name: 'Writing', slug: 'writing' },
          { name: 'Design', slug: 'design' },
          { name: 'Development', slug: 'development' },
        ],
      },
      {
        name: 'Work From Home',
        slug: 'work-from-home',
        leafCategories: [
          { name: 'Data Entry', slug: 'data-entry' },
          { name: 'Customer Support', slug: 'customer-support' },
          { name: 'Content Writing', slug: 'content-writing' },
        ],
      },
    ],
  },
  {
    name: 'ReSelloServices',
    slug: 'resello-services',
    icon: 'wrench',
    subCategories: [
      {
        name: 'Home Services',
        slug: 'home-services',
        leafCategories: [
          { name: 'Cleaning', slug: 'cleaning' },
          { name: 'Plumbing', slug: 'plumbing' },
          { name: 'Electrical', slug: 'electrical' },
          { name: 'Carpentry', slug: 'carpentry' },
        ],
      },
      {
        name: 'Repair Services',
        slug: 'repair-services',
        leafCategories: [
          { name: 'AC Repair', slug: 'ac-repair' },
          { name: 'Appliance Repair', slug: 'appliance-repair' },
          { name: 'Mobile Repair', slug: 'mobile-repair' },
        ],
      },
      {
        name: 'Event Services',
        slug: 'event-services',
        leafCategories: [
          { name: 'Catering', slug: 'catering' },
          { name: 'Photography', slug: 'photography' },
          { name: 'Decoration', slug: 'decoration' },
        ],
      },
    ],
  },
  {
    name: 'ReSelloEducation',
    slug: 'resello-education',
    icon: 'book',
    subCategories: [
      {
        name: 'Tuitions',
        slug: 'tuitions',
        leafCategories: [
          { name: 'School Tuition', slug: 'school-tuition' },
          { name: 'College Tuition', slug: 'college-tuition' },
          { name: 'Competitive Exams', slug: 'competitive-exams' },
        ],
      },
      {
        name: 'Classes',
        slug: 'classes',
        leafCategories: [
          { name: 'Music Classes', slug: 'music-classes' },
          { name: 'Dance Classes', slug: 'dance-classes' },
          { name: 'Art Classes', slug: 'art-classes' },
        ],
      },
      {
        name: 'Courses',
        slug: 'courses',
        leafCategories: [
          { name: 'Programming', slug: 'programming' },
          { name: 'Language Learning', slug: 'language-learning' },
          { name: 'Professional Courses', slug: 'professional-courses' },
        ],
      },
    ],
  },
];

export async function seedCategories() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('Starting categories seeding...');

    for (const parentData of categoriesData) {
      // Check if parent category already exists
      const existingParent = await queryRunner.query(
        'SELECT id FROM parent_categories WHERE slug = $1',
        [parentData.slug],
      );

      let parentId: string;

      if (existingParent.length > 0) {
        parentId = existingParent[0].id;
        console.log(`Parent category ${parentData.name} already exists, skipping...`);
      } else {
        // Insert parent category
        const parentResult = await queryRunner.query(
          'INSERT INTO parent_categories (name, slug, icon) VALUES ($1, $2, $3) RETURNING id',
          [parentData.name, parentData.slug, parentData.icon],
        );
        parentId = parentResult[0].id;
        console.log(`Inserted parent category: ${parentData.name}`);
      }

      // Insert sub-categories
      for (const subData of parentData.subCategories) {
        // Check if sub-category already exists
        const existingSub = await queryRunner.query(
          'SELECT id FROM sub_categories WHERE slug = $1 AND "parentId" = $2',
          [subData.slug, parentId],
        );

        let subId: string;

        if (existingSub.length > 0) {
          subId = existingSub[0].id;
          console.log(`  Sub-category ${subData.name} already exists, skipping...`);
        } else {
          // Insert sub-category
          const subResult = await queryRunner.query(
            'INSERT INTO sub_categories (name, slug, "parentId") VALUES ($1, $2, $3) RETURNING id',
            [subData.name, subData.slug, parentId],
          );
          subId = subResult[0].id;
          console.log(`  - Inserted sub-category: ${subData.name}`);
        }

        // Insert leaf categories
        for (const leafData of subData.leafCategories) {
          // Check if leaf category already exists
          const existingLeaf = await queryRunner.query(
            'SELECT id FROM leaf_categories WHERE slug = $1 AND "subCategoryId" = $2',
            [leafData.slug, subId],
          );

          if (existingLeaf.length === 0) {
            await queryRunner.query(
              'INSERT INTO leaf_categories (name, slug, "subCategoryId") VALUES ($1, $2, $3)',
              [leafData.name, leafData.slug, subId],
            );
            console.log(`    * Inserted leaf category: ${leafData.name}`);
          }
        }
      }
    }

    await queryRunner.release();
    console.log('Categories seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
}

// Run seeder if executed directly
if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
