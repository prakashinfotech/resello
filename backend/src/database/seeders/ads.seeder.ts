import { AppDataSource } from '../data-source';

interface AdTemplate {
  title: string;
  description: string;
  priceRange: [number, number];
}

const adTemplates: Record<string, AdTemplate[]> = {
  electronics: [
    {
      title: 'iPhone 14 128GB Midnight Black',
      description:
        'iPhone 14 128GB in Midnight Black. Purchased 8 months ago, always kept in case with screen protector. Battery health 98%. Face ID works perfectly. Selling due to upgrade.',
      priceRange: [72000, 80000],
    },
    {
      title: 'Samsung Galaxy S22 Ultra 256GB',
      description:
        'Samsung Galaxy S22 Ultra 256GB in Phantom Black. S-Pen included. Excellent display with 120Hz. Single owner, no drops or cracks. All original accessories included.',
      priceRange: [60000, 70000],
    },
    {
      title: 'LG 43 inch Full HD Smart TV',
      description:
        'LG 43 inch Full HD Smart TV with webOS. ThinQ AI for voice control. Multiple HDMI and USB ports. 6 months old, perfect working condition. Wall bracket included.',
      priceRange: [22000, 27000],
    },
    {
      title: 'MacBook Air M2 8GB 256GB',
      description:
        'Apple MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Starlight color. Ultra-thin, fanless design. 18-hour battery life. In excellent condition with original box. No scratches.',
      priceRange: [90000, 100000],
    },
    {
      title: 'HP Pavilion Gaming Laptop i5',
      description:
        'HP Pavilion Gaming laptop with Intel Core i5, 8GB RAM, 512GB SSD, GTX 1650 GPU. 15.6 inch FHD 144Hz display. Shadow Black. 1 year old, well maintained.',
      priceRange: [55000, 65000],
    },
    {
      title: 'Sony Alpha 6000 Mirrorless Camera',
      description:
        'Sony Alpha 6000 mirrorless camera with 16-50mm kit lens. 24.3MP APS-C sensor. Fast autofocus. Perfect for travel and street photography. Lightly used with all accessories.',
      priceRange: [35000, 42000],
    },
    {
      title: 'JBL Portable Bluetooth Speaker',
      description:
        'JBL Flip 6 portable Bluetooth speaker. Waterproof IP67. 12 hours battery. Powerful bass. Red color. Barely used. Original box and charging cable included.',
      priceRange: [8000, 10000],
    },
    {
      title: 'OnePlus 11 5G 256GB',
      description:
        'OnePlus 11 5G, 256GB, Titan Black. Snapdragon 8 Gen 2, 16GB RAM. 120Hz AMOLED display. 100W fast charging. 6 months old, no issues. Selling with cover and screen guard.',
      priceRange: [48000, 55000],
    },
    {
      title: 'iPad Air 5th Gen 64GB WiFi',
      description:
        'Apple iPad Air 5th generation with M1 chip, 64GB, WiFi. Space Gray. Comes with Apple Pencil 1st gen and Smart Folio cover. Excellent condition, barely used.',
      priceRange: [52000, 60000],
    },
    {
      title: 'PlayStation 5 Disc Edition',
      description:
        'Sony PlayStation 5 Disc Edition in perfect condition. Comes with 1 controller, HDMI cable, and 2 games. Purchased 4 months ago. No issues whatsoever.',
      priceRange: [45000, 52000],
    },
  ],

  furniture: [
    {
      title: 'L-Shaped Fabric Sofa 5 Seater',
      description:
        'Modern L-shaped fabric sofa in grey. 5 seater with chaise lounge. High-density foam cushions. Sturdy metal legs. 8 months old, excellent condition. Comes with throw pillows.',
      priceRange: [28000, 38000],
    },
    {
      title: 'Queen Size Platform Bed Frame',
      description:
        'Minimalist queen size platform bed frame in teak wood. No box spring needed. Sturdy slat support. White finish. 1 year old, no scratches. Easy to disassemble.',
      priceRange: [18000, 25000],
    },
    {
      title: '4 Seater Marble Top Dining Table',
      description:
        'Elegant marble top dining table with 4 upholstered chairs. Italian marble surface. Stainless steel frame. 1 year old, excellent condition. Very easy to clean.',
      priceRange: [22000, 30000],
    },
    {
      title: 'Executive Leather Office Chair',
      description:
        'Premium executive leather office chair with high back and headrest. PU leather, adjustable recline, 360° swivel. Black color. 6 months old, like new.',
      priceRange: [10000, 15000],
    },
    {
      title: 'Sliding Door Wardrobe 6 Feet',
      description:
        '6-feet wide sliding door wardrobe with internal LED light. High-gloss white finish. Multiple compartments and drawers. 2 years old, very good condition.',
      priceRange: [18000, 24000],
    },
    {
      title: 'Solid Wood Study Table with Drawer',
      description:
        'Solid sheesham wood study table with 2 drawers and a bookshelf. Honey oak finish. Spacious tabletop. Perfect for students and work-from-home. 1 year old.',
      priceRange: [6000, 9000],
    },
    {
      title: 'Foldable Metal Bunk Bed',
      description:
        'Metal bunk bed with ladder and safety railing. Fits two single mattresses. Silver-grey finish. Ideal for kids room or hostel. 1 year old, no rust.',
      priceRange: [12000, 16000],
    },
  ],

  cars: [
    {
      title: 'Maruti Baleno Zeta 2021',
      description:
        'Maruti Suzuki Baleno Zeta petrol, 2021. Premium hatchback in Pearl White. Apple CarPlay & Android Auto. 25000 km driven. Accident-free, single owner. All service done at dealership.',
      priceRange: [650000, 720000],
    },
    {
      title: 'Hyundai i20 Sportz 2022',
      description:
        'Hyundai i20 Sportz 1.2 petrol, 2022. Thunder Blue. Wireless charging, auto climate control, connected car tech. 18000 km. First owner with full service history.',
      priceRange: [780000, 860000],
    },
    {
      title: 'Tata Nexon EV Max 2022',
      description:
        'Tata Nexon EV Max, 2022, Dark Edition. 437km certified range. Loaded: sunroof, connected tech. 22000 km. First owner. Accident-free. All service at Tata dealer.',
      priceRange: [1600000, 1750000],
    },
    {
      title: 'Kia Seltos HTX 2021',
      description:
        'Kia Seltos HTX petrol manual 2021, Galaxy Blue. Bose sound system, 360-degree camera, panoramic sunroof. 28000 km. Non-accidental. All service records available.',
      priceRange: [1400000, 1550000],
    },
    {
      title: 'Toyota Innova Crysta GX 2019',
      description:
        'Toyota Innova Crysta GX diesel 2019, White. 7-seater, well maintained. Excellent condition. 55000 km. Perfect for family or commercial use. All documents clear.',
      priceRange: [1700000, 1900000],
    },
  ],

  bikes: [
    {
      title: 'Royal Enfield Meteor 350',
      description:
        'Royal Enfield Meteor 350 Fireball Red. 2021 model. Smooth cruiser with Tripper navigation. 12000 km. Single owner, all dealer service done. Excellent condition.',
      priceRange: [155000, 175000],
    },
    {
      title: 'TVS Jupiter Classic 2022',
      description:
        'TVS Jupiter Classic 110cc, 2022, Wine Red. Excellent mileage. USB charging port, large boot space. 8000 km. Single owner. All service records available.',
      priceRange: [68000, 76000],
    },
    {
      title: 'Bajaj Pulsar NS200 2021',
      description:
        'Bajaj Pulsar NS200, 2021, Pewter Grey. Sporty naked street fighter. 15000 km. ABS, liquid cooled, LED headlamps. No accidents, full service history.',
      priceRange: [105000, 118000],
    },
    {
      title: 'KTM Duke 390 2022',
      description:
        'KTM 390 Duke 2022, orange. TFT display, Supermoto ABS, ride-by-wire. 10000 km. Always serviced at KTM service centre. Excellent condition, no modifications.',
      priceRange: [265000, 295000],
    },
    {
      title: 'Yamaha FZ-S V3 FI 2021',
      description:
        'Yamaha FZ-S V3 Fuel Injected 2021, Matte Black. 16000 km. Smooth power delivery, great city ride. Single owner, all service at Yamaha ASS. Tyres in good condition.',
      priceRange: [92000, 105000],
    },
  ],

  properties: [
    {
      title: '1 BHK Studio Apartment for Rent',
      description:
        'Fully furnished 1 BHK studio apartment. 500 sq ft. AC, fridge, washing machine included. 24/7 security. WiFi ready. Ideal for working professionals. Metro accessible.',
      priceRange: [10000, 14000],
    },
    {
      title: '2 BHK Flat for Sale Near IT Park',
      description:
        '2 BHK flat for sale, 850 sq ft, in a gated society near IT Park. 5th floor, east facing. Modular kitchen, vitrified tiles, power backup. Ready to move. Clear legal title.',
      priceRange: [4200000, 4800000],
    },
    {
      title: 'Office Space for Rent 1200 sq ft',
      description:
        'Ready-to-move office space, 1200 sq ft, on 3rd floor of commercial building. Open-plan layout, 2 cabins, conference room. Central AC. Parking for 4 vehicles. Business district location.',
      priceRange: [55000, 70000],
    },
    {
      title: 'Residential Plot for Sale 200 sq yd',
      description:
        '200 sq yard residential plot for sale in developing township. RERA approved layout. Wide road facing. All utilities available at boundary. NA order obtained. Great investment.',
      priceRange: [2500000, 3000000],
    },
    {
      title: '4 BHK Duplex Villa for Sale',
      description:
        '4 BHK duplex villa, 2800 sq ft, in gated villa community. Private garden, 2-car garage, terrace. Premium fittings, smart home automation. Ready to occupy. Bank loan available.',
      priceRange: [9500000, 11000000],
    },
  ],

  jobs: [
    {
      title: 'React Frontend Developer',
      description:
        'Looking for React.js frontend developer. 1-3 years experience. TypeScript, REST APIs, Git proficiency required. Hybrid work. Flexible hours. ESOP benefits. Startup environment.',
      priceRange: [500000, 750000],
    },
    {
      title: 'Digital Marketing Executive',
      description:
        'Hiring Digital Marketing Executive. Experience with Google Ads, Meta Ads, SEO. 1-2 years experience. Full time, 5-day work week. Paid leaves and health insurance.',
      priceRange: [360000, 480000],
    },
    {
      title: 'Customer Support Executive',
      description:
        'Customer support executive required for e-commerce company. Good English and Hindi communication. Freshers welcome. Day shift. 5-day week. PF and ESI provided.',
      priceRange: [240000, 320000],
    },
    {
      title: 'Accounts and Finance Manager',
      description:
        'CA/MBA Finance required for Accounts Manager role. 5+ years experience in GST, TDS, balance sheet finalization. Leadership skills. MNC preferred. Monday-Friday.',
      priceRange: [900000, 1200000],
    },
  ],

  services: [
    {
      title: 'AC Repair and Service',
      description:
        'Expert AC service and repair for all brands. Gas refilling, coil cleaning, PCB repair, installation. Same-day service available. Experienced technicians. Transparent pricing.',
      priceRange: [400, 1200],
    },
    {
      title: 'Electrician for Home Repairs',
      description:
        'Certified electrician for all home electrical work. Wiring, switchboard repair, fan fitting, short circuit fixing. Fast response. 5+ years experience. All areas covered.',
      priceRange: [300, 800],
    },
    {
      title: 'Interior Design Consultation',
      description:
        'Professional interior design consultation for homes and offices. 3D visualization, material selection, contractor management. Budget-friendly plans. 10+ projects delivered.',
      priceRange: [15000, 40000],
    },
    {
      title: 'Pest Control Service',
      description:
        'Residential and commercial pest control. Cockroach, termite, rodent treatment. Odourless chemicals. 3-month guarantee. Certified team. Same-day booking available.',
      priceRange: [800, 2500],
    },
    {
      title: 'Car Washing and Detailing',
      description:
        'Doorstep car washing and detailing service. Interior vacuum, exterior polish, ceramic coating available. All car types. Sunday available. Book online or by call.',
      priceRange: [500, 3000],
    },
  ],

  education: [
    {
      title: 'Science Tuition Class 8-10',
      description:
        'B.Sc graduate offering Physics, Chemistry, Biology tuition for classes 8-10. CBSE. Small batches for personal attention. Notes provided. Online and offline available.',
      priceRange: [2500, 4000],
    },
    {
      title: 'Keyboard and Piano Classes',
      description:
        'Piano/keyboard classes for all ages. Classical and Bollywood repertoire. Trinity-certified teacher. Home visits available. 1:1 classes. Beginners welcome. Flexible schedule.',
      priceRange: [2500, 4000],
    },
    {
      title: 'Spoken English and Communication',
      description:
        'Improve your spoken English confidence in 60 days. Group and individual batches. Pronunciation, vocabulary, interviews. Corporate training also available. Weekend slots.',
      priceRange: [3000, 6000],
    },
    {
      title: 'IELTS Coaching - Guaranteed Score',
      description:
        'IELTS coaching with score guarantee. Band 7+ target. Listening, reading, writing, speaking covered. Weekly mock tests. 10 years experience. Flexible batch timings.',
      priceRange: [8000, 12000],
    },
    {
      title: 'Drawing and Painting Classes',
      description:
        'Art classes for kids and adults. Pencil sketching, watercolor, acrylic painting. Online and home tuition. All materials provided. Beginners to advanced. Holiday batches too.',
      priceRange: [1500, 2500],
    },
  ],
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPrice(range: [number, number]): number {
  return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

function getRandomViews(): number {
  return Math.floor(Math.random() * 500);
}

export async function seedAds() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('Starting ads seeding...');

    // Get all seller users
    const sellers: Array<{ id: string }> = await queryRunner.query(
      "SELECT id FROM users WHERE email LIKE 'seller%@example.com'",
    );

    if (sellers.length === 0) {
      console.log('No seller users found. Please run users seeder first.');
      await queryRunner.release();
      return;
    }

    // Get all leaf categories
    const leafCategories: Array<{ id: string; slug: string }> = await queryRunner.query(
      'SELECT id, slug FROM leaf_categories',
    );

    if (leafCategories.length === 0) {
      console.log('No leaf categories found. Please run categories seeder first.');
      await queryRunner.release();
      return;
    }

    // Get all cities
    const cities: Array<{ id: string }> = await queryRunner.query('SELECT id FROM cities');

    if (cities.length === 0) {
      console.log('No cities found. Please run cities seeder first.');
      await queryRunner.release();
      return;
    }

    let totalAdsCreated = 0;

    // Create 7-10 ads per seller
    for (const seller of sellers) {
      const numAds = Math.floor(Math.random() * 4) + 7; // 7-10 ads

      for (let i = 0; i < numAds; i++) {
        // Select random category
        const category = getRandomElement(leafCategories);

        // Determine which template set to use based on category slug
        let templateKey = 'electronics';
        if (category.slug.includes('sofa') || category.slug.includes('bed') ||
          category.slug.includes('table') || category.slug.includes('chair') ||
          category.slug.includes('wardrobe')) {
          templateKey = 'furniture';
        } else if (category.slug.includes('sedan') || category.slug.includes('suv') ||
          category.slug.includes('hatchback') || category.slug.includes('luxury')) {
          templateKey = 'cars';
        } else if (category.slug.includes('bike') || category.slug.includes('scooter') ||
          category.slug.includes('cruiser') || category.slug.includes('commuter')) {
          templateKey = 'bikes';
        } else if (category.slug.includes('bhk') || category.slug.includes('apartment') ||
          category.slug.includes('house') || category.slug.includes('villa') ||
          category.slug.includes('commercial') || category.slug.includes('land')) {
          templateKey = 'properties';
        } else if (category.slug.includes('job') || category.slug.includes('sales') ||
          category.slug.includes('marketing') || category.slug.includes('finance')) {
          templateKey = 'jobs';
        } else if (category.slug.includes('cleaning') || category.slug.includes('plumbing') ||
          category.slug.includes('repair') || category.slug.includes('photography')) {
          templateKey = 'services';
        } else if (category.slug.includes('tuition') || category.slug.includes('class') ||
          category.slug.includes('course') || category.slug.includes('programming')) {
          templateKey = 'education';
        }

        const templates = adTemplates[templateKey] || adTemplates.electronics;
        const template = getRandomElement(templates);

        // Select random city
        const city = getRandomElement(cities);

        // Get areas for this city
        const areas: Array<{ id: string }> = await queryRunner.query(
          'SELECT id FROM areas WHERE "cityId" = $1',
          [city.id],
        );

        if (areas.length === 0) {
          continue;
        }

        const area = getRandomElement(areas);

        // Generate random price and views
        const price = getRandomPrice(template.priceRange);
        const views = getRandomViews();

        // Check if similar ad already exists
        const existingAd = await queryRunner.query(
          'SELECT id FROM ads WHERE title = $1 AND "userId" = $2',
          [template.title, seller.id],
        );

        if (existingAd.length > 0) {
          continue;
        }

        // Insert ad
        await queryRunner.query(
          `INSERT INTO ads (title, description, price, "userId", "categoryId", "cityId", "areaId", views, "isActive") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            template.title,
            template.description,
            price,
            seller.id,
            category.id,
            city.id,
            area.id,
            views,
            true,
          ],
        );

        totalAdsCreated++;
      }
    }

    await queryRunner.release();
    console.log(`Ads seeding completed successfully! Created ${totalAdsCreated} ads.`);
  } catch (error) {
    console.error('Error seeding ads:', error);
    throw error;
  }
}

// Run seeder if executed directly
if (require.main === module) {
  seedAds()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
