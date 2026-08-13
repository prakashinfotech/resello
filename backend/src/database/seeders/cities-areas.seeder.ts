import { AppDataSource } from '../data-source';

interface CityData {
  name: string;
  state: string;
  areas: string[];
}

const citiesData: CityData[] = [
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    areas: ['Andheri', 'Bandra', 'Borivali', 'Dadar', 'Goregaon', 'Juhu', 'Malad', 'Powai'],
  },
  {
    name: 'Delhi',
    state: 'Delhi',
    areas: ['Connaught Place', 'Dwarka', 'Karol Bagh', 'Lajpat Nagar', 'Nehru Place', 'Rohini', 'Saket', 'Vasant Kunj'],
  },
  {
    name: 'Bangalore',
    state: 'Karnataka',
    areas: ['Indiranagar', 'Koramangala', 'Whitefield', 'Electronic City', 'Jayanagar', 'HSR Layout', 'Marathahalli', 'BTM Layout'],
  },
  {
    name: 'Hyderabad',
    state: 'Telangana',
    areas: ['Banjara Hills', 'Gachibowli', 'Hitech City', 'Jubilee Hills', 'Kukatpally', 'Madhapur', 'Secunderabad', 'Uppal'],
  },
  {
    name: 'Chennai',
    state: 'Tamil Nadu',
    areas: ['Adyar', 'Anna Nagar', 'Mylapore', 'T Nagar', 'Velachery', 'Tambaram', 'Porur', 'OMR'],
  },
  {
    name: 'Kolkata',
    state: 'West Bengal',
    areas: ['Salt Lake', 'Park Street', 'Howrah', 'Ballygunge', 'Alipore', 'New Town', 'Rajarhat', 'Jadavpur'],
  },
  {
    name: 'Pune',
    state: 'Maharashtra',
    areas: ['Hinjewadi', 'Kothrud', 'Viman Nagar', 'Wakad', 'Baner', 'Aundh', 'Hadapsar', 'Magarpatta'],
  },
  {
    name: 'Ahmedabad',
    state: 'Gujarat',
    areas: ['Satellite', 'Vastrapur', 'Maninagar', 'Navrangpura', 'Bopal', 'Prahlad Nagar', 'Gota', 'Chandkheda'],
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    areas: ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'C Scheme', 'Raja Park', 'Jagatpura', 'Tonk Road', 'Ajmer Road'],
  },
  {
    name: 'Surat',
    state: 'Gujarat',
    areas: ['Adajan', 'Vesu', 'Pal', 'Athwa', 'Rander', 'Piplod', 'Citylight', 'Udhna'],
  },
  {
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    areas: ['Gomti Nagar', 'Hazratganj', 'Indira Nagar', 'Alambagh', 'Aliganj', 'Mahanagar', 'Chinhat', 'Rajajipuram'],
  },
  {
    name: 'Kanpur',
    state: 'Uttar Pradesh',
    areas: ['Swaroop Nagar', 'Kakadeo', 'Kalyanpur', 'Kidwai Nagar', 'Civil Lines', 'Armapur', 'Panki', 'Barra'],
  },
  {
    name: 'Nagpur',
    state: 'Maharashtra',
    areas: ['Dharampeth', 'Sadar', 'Sitabuldi', 'Wardha Road', 'Hingna', 'Manish Nagar', 'Pratap Nagar', 'Laxmi Nagar'],
  },
  {
    name: 'Indore',
    state: 'Madhya Pradesh',
    areas: ['Vijay Nagar', 'Palasia', 'Rau', 'Bhawarkuan', 'Sudama Nagar', 'Nipania', 'Scheme 54', 'AB Road'],
  },
  {
    name: 'Thane',
    state: 'Maharashtra',
    areas: ['Ghodbunder Road', 'Majiwada', 'Naupada', 'Vartak Nagar', 'Kasarvadavali', 'Kolshet', 'Wagle Estate', 'Hiranandani Estate'],
  },
  {
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    areas: ['Arera Colony', 'MP Nagar', 'Kolar Road', 'Hoshangabad Road', 'Berasia Road', 'Ayodhya Nagar', 'Shahpura', 'Bawadiya Kalan'],
  },
  {
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    areas: ['MVP Colony', 'Madhurawada', 'Gajuwaka', 'Dwaraka Nagar', 'Rushikonda', 'Siripuram', 'NAD', 'Seethammadhara'],
  },
  {
    name: 'Patna',
    state: 'Bihar',
    areas: ['Boring Road', 'Kankarbagh', 'Patliputra', 'Rajendra Nagar', 'Fraser Road', 'Danapur', 'Digha', 'Bailey Road'],
  },
  {
    name: 'Vadodara',
    state: 'Gujarat',
    areas: ['Alkapuri', 'Gotri', 'Manjalpur', 'Vasna', 'Akota', 'Fatehgunj', 'Sayajigunj', 'Waghodia'],
  },
  {
    name: 'Ghaziabad',
    state: 'Uttar Pradesh',
    areas: ['Indirapuram', 'Vaishali', 'Raj Nagar', 'Kaushambi', 'Crossings Republik', 'Vasundhara', 'Mohan Nagar', 'Govindpuram'],
  },
  {
    name: 'Ludhiana',
    state: 'Punjab',
    areas: ['Model Town', 'Sarabha Nagar', 'Dugri', 'Pakhowal Road', 'Civil Lines', 'Ferozepur Road', 'BRS Nagar', 'Haibowal'],
  },
  {
    name: 'Agra',
    state: 'Uttar Pradesh',
    areas: ['Sanjay Place', 'Kamla Nagar', 'Sikandra', 'Dayal Bagh', 'Tajganj', 'Sadar Bazaar', 'Lohamandi', 'Bodla'],
  },
  {
    name: 'Nashik',
    state: 'Maharashtra',
    areas: ['Gangapur Road', 'College Road', 'Panchavati', 'Satpur', 'Indira Nagar', 'Ashok Stambh', 'Pathardi Phata', 'Dwarka'],
  },
  {
    name: 'Faridabad',
    state: 'Haryana',
    areas: ['Sector 15', 'Sector 16', 'NIT', 'Old Faridabad', 'Greater Faridabad', 'Neharpar', 'Ballabgarh', 'Sector 21'],
  },
  {
    name: 'Meerut',
    state: 'Uttar Pradesh',
    areas: ['Shastri Nagar', 'Ganga Nagar', 'Brahmpuri', 'Kanker Khera', 'Pallavpuram', 'Modipuram', 'Saket', 'Begum Bridge'],
  },
  {
    name: 'Rajkot',
    state: 'Gujarat',
    areas: ['Kalawad Road', 'University Road', 'Raiya Road', 'Mavdi', 'Kotecha Chowk', 'Jamnagar Road', '150 Feet Ring Road', 'Gondal Road'],
  },
  {
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    areas: ['Sigra', 'Lanka', 'Sarnath', 'Bhelupur', 'Nadesar', 'Mahmoorganj', 'Cantonment', 'Shivpur'],
  },
  {
    name: 'Srinagar',
    state: 'Jammu and Kashmir',
    areas: ['Lal Chowk', 'Rajbagh', 'Jawahar Nagar', 'Hyderpora', 'Bemina', 'Soura', 'Batmaloo', 'Gogji Bagh'],
  },
  {
    name: 'Aurangabad',
    state: 'Maharashtra',
    areas: ['Cidco', 'Jalna Road', 'Beed Bypass', 'Town Center', 'Garkheda', 'Osmanpura', 'Padegaon', 'Satara Parisar'],
  },
  {
    name: 'Dhanbad',
    state: 'Jharkhand',
    areas: ['Bank More', 'Hirapur', 'Saraidhela', 'Bartand', 'Wasseypur', 'Jharia', 'Sindri', 'Katras'],
  },
  {
    name: 'Amritsar',
    state: 'Punjab',
    areas: ['Ranjit Avenue', 'Lawrence Road', 'Mall Road', 'Chheharta', 'Majitha Road', 'GT Road', 'Batala Road', 'Putlighar'],
  },
  {
    name: 'Allahabad',
    state: 'Uttar Pradesh',
    areas: ['Civil Lines', 'George Town', 'Kareli', 'Naini', 'Jhunsi', 'Mumfordganj', 'Katra', 'Colonelganj'],
  },
  {
    name: 'Ranchi',
    state: 'Jharkhand',
    areas: ['Kanke Road', 'Harmu', 'Doranda', 'Lalpur', 'Hinoo', 'Bariatu', 'Morabadi', 'Ashok Nagar'],
  },
  {
    name: 'Howrah',
    state: 'West Bengal',
    areas: ['Shibpur', 'Santragachi', 'Liluah', 'Belur', 'Bally', 'Kadamtala', 'Pilkhana', 'Ramrajatala'],
  },
  {
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    areas: ['RS Puram', 'Saibaba Colony', 'Gandhipuram', 'Peelamedu', 'Singanallur', 'Saravanampatti', 'Vadavalli', 'Kuniyamuthur'],
  },
  {
    name: 'Jabalpur',
    state: 'Madhya Pradesh',
    areas: ['Napier Town', 'Wright Town', 'Civil Lines', 'Vijay Nagar', 'Gorakhpur', 'Madan Mahal', 'Adhartal', 'Ranjhi'],
  },
  {
    name: 'Gwalior',
    state: 'Madhya Pradesh',
    areas: ['City Center', 'Thatipur', 'Morar', 'Lashkar', 'Jhansi Road', 'Maharaj Bada', 'Bahodapur', 'Shivpuri Link Road'],
  },
  {
    name: 'Vijayawada',
    state: 'Andhra Pradesh',
    areas: ['Benz Circle', 'MG Road', 'Governorpet', 'Patamata', 'Bhavanipuram', 'Gunadala', 'Labbipet', 'Moghalrajpuram'],
  },
  {
    name: 'Jodhpur',
    state: 'Rajasthan',
    areas: ['Sardarpura', 'Paota', 'Ratanada', 'Shastri Nagar', 'Chopasni', 'Pal Road', 'Basni', 'Mandore'],
  },
  {
    name: 'Madurai',
    state: 'Tamil Nadu',
    areas: ['Anna Nagar', 'KK Nagar', 'Villapuram', 'Thirunagar', 'Goripalayam', 'SS Colony', 'Pasumalai', 'Sellur'],
  },
  {
    name: 'Raipur',
    state: 'Chhattisgarh',
    areas: ['Shankar Nagar', 'Devendra Nagar', 'Pandri', 'Tatibandh', 'Mowa', 'Telibandha', 'Kota', 'Dhamtari Road'],
  },
  {
    name: 'Kota',
    state: 'Rajasthan',
    areas: ['Talwandi', 'Dadabari', 'Mahaveer Nagar', 'Vigyan Nagar', 'Gumanpura', 'Kunhari', 'Aerodrome Circle', 'Rangbari'],
  },
  {
    name: 'Chandigarh',
    state: 'Chandigarh',
    areas: ['Sector 17', 'Sector 22', 'Sector 35', 'Sector 43', 'Sector 8', 'Sector 9', 'Sector 15', 'Sector 26'],
  },
  {
    name: 'Guwahati',
    state: 'Assam',
    areas: ['Paltan Bazaar', 'Fancy Bazaar', 'Ganeshguri', 'Beltola', 'Hatigaon', 'Khanapara', 'Dispur', 'Ulubari'],
  },
  {
    name: 'Solapur',
    state: 'Maharashtra',
    areas: ['Jule Solapur', 'Hotgi Road', 'Sakhar Peth', 'Siddheshwar Peth', 'Murarji Peth', 'Ashok Chowk', 'Vijapur Road', 'Akkalkot Road'],
  },
  {
    name: 'Hubli',
    state: 'Karnataka',
    areas: ['Vidyanagar', 'Keshwapur', 'Gokul Road', 'Unkal', 'Navanagar', 'Deshpande Nagar', 'Hosur', 'Rayapur'],
  },
  {
    name: 'Mysore',
    state: 'Karnataka',
    areas: ['Vijayanagar', 'Kuvempunagar', 'Saraswathipuram', 'Jayalakshmipuram', 'Gokulam', 'Hebbal', 'Yadavagiri', 'Bogadi'],
  },
  {
    name: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    areas: ['Thillai Nagar', 'Srirangam', 'KK Nagar', 'Cantonment', 'Puthur', 'Tennur', 'Woraiyur', 'Ariyamangalam'],
  },
  {
    name: 'Bareilly',
    state: 'Uttar Pradesh',
    areas: ['Civil Lines', 'Prem Nagar', 'Subhash Nagar', 'Izzatnagar', 'Rampur Garden', 'Faridpur', 'Gayatri Nagar', 'Cantt'],
  },
  {
    name: 'Aligarh',
    state: 'Uttar Pradesh',
    areas: ['Civil Lines', 'Ramghat Road', 'Marris Road', 'Dodhpur', 'Quarsi', 'Sasni Gate', 'Delhi Gate', 'Jamalpur'],
  },
  {
    name: 'Salem',
    state: 'Tamil Nadu',
    areas: ['Fairlands', 'Hasthampatti', 'Ammapet', 'Suramangalam', 'Shevapet', 'Gugai', 'Kondalampatti', 'Swarnapuri'],
  },
];

export async function seedCitiesAndAreas() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('Starting cities and areas seeding...');

    for (const cityData of citiesData) {
      // Check if city already exists
      const existingCity = await queryRunner.query(
        'SELECT id FROM cities WHERE name = $1 AND state = $2',
        [cityData.name, cityData.state],
      );

      let cityId: string;

      if (existingCity.length > 0) {
        cityId = existingCity[0].id;
        console.log(`City ${cityData.name} already exists, skipping...`);
      } else {
        // Insert city
        const cityResult = await queryRunner.query(
          'INSERT INTO cities (name, state) VALUES ($1, $2) RETURNING id',
          [cityData.name, cityData.state],
        );
        cityId = cityResult[0].id;
        console.log(`Inserted city: ${cityData.name}, ${cityData.state}`);
      }

      // Insert areas for this city
      for (const areaName of cityData.areas) {
        // Check if area already exists
        const existingArea = await queryRunner.query(
          'SELECT id FROM areas WHERE name = $1 AND "cityId" = $2',
          [areaName, cityId],
        );

        if (existingArea.length === 0) {
          await queryRunner.query(
            'INSERT INTO areas (name, "cityId") VALUES ($1, $2)',
            [areaName, cityId],
          );
          console.log(`  - Inserted area: ${areaName}`);
        }
      }
    }

    await queryRunner.release();
    console.log('Cities and areas seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding cities and areas:', error);
    throw error;
  }
}

// Run seeder if executed directly
if (require.main === module) {
  seedCitiesAndAreas()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
