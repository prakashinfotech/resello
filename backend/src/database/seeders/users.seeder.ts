import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';

interface UserData {
  email: string;
  password: string;
  name: string;
  phone: string;
  type: 'buyer' | 'seller';
}

const usersData: UserData[] = [
  // Buyer users
  {
    email: 'buyer1@example.com',
    password: 'buyer@123',
    name: 'Rajesh Kumar',
    phone: '9876543210',
    type: 'buyer',
  },
  {
    email: 'buyer2@example.com',
    password: 'buyer@123',
    name: 'Priya Sharma',
    phone: '9876543211',
    type: 'buyer',
  },
  {
    email: 'buyer3@example.com',
    password: 'buyer@123',
    name: 'Amit Patel',
    phone: '9876543212',
    type: 'buyer',
  },
  {
    email: 'buyer4@example.com',
    password: 'buyer@123',
    name: 'Sneha Reddy',
    phone: '9876543213',
    type: 'buyer',
  },
  {
    email: 'buyer5@example.com',
    password: 'buyer@123',
    name: 'Vikram Singh',
    phone: '9876543214',
    type: 'buyer',
  },
  // Seller users
  {
    email: 'seller1@example.com',
    password: 'seller@123',
    name: 'Suresh Gupta',
    phone: '9876543215',
    type: 'seller',
  },
  {
    email: 'seller2@example.com',
    password: 'seller@123',
    name: 'Anjali Verma',
    phone: '9876543216',
    type: 'seller',
  },
  {
    email: 'seller3@example.com',
    password: 'seller@123',
    name: 'Rahul Mehta',
    phone: '9876543217',
    type: 'seller',
  },
  {
    email: 'seller4@example.com',
    password: 'seller@123',
    name: 'Kavita Joshi',
    phone: '9876543218',
    type: 'seller',
  },
  {
    email: 'seller5@example.com',
    password: 'seller@123',
    name: 'Deepak Agarwal',
    phone: '9876543219',
    type: 'seller',
  },
];

export async function seedUsers() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('Starting users seeding...');

    for (const userData of usersData) {
      // Check if user already exists
      const existingUser = await queryRunner.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email],
      );

      if (existingUser.length > 0) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Insert user
      await queryRunner.query(
        'INSERT INTO users (email, password, name, phone) VALUES ($1, $2, $3, $4)',
        [userData.email, hashedPassword, userData.name, userData.phone],
      );

      console.log(`Inserted ${userData.type} user: ${userData.name} (${userData.email})`);
    }

    await queryRunner.release();
    console.log('Users seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

// Run seeder if executed directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
