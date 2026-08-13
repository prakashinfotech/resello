import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City, Area } from './entities';

// Approximate coordinates for major Indian cities
// Used for reverse geocoding without an external API
const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Delhi': { lat: 28.7041, lon: 77.1025 },
  'Bangalore': { lat: 12.9716, lon: 77.5946 },
  'Bengaluru': { lat: 12.9716, lon: 77.5946 },
  'Hyderabad': { lat: 17.3850, lon: 78.4867 },
  'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'Chennai': { lat: 13.0827, lon: 80.2707 },
  'Kolkata': { lat: 22.5726, lon: 88.3639 },
  'Surat': { lat: 21.1702, lon: 72.8311 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Jaipur': { lat: 26.9124, lon: 75.7873 },
  'Lucknow': { lat: 26.8467, lon: 80.9462 },
  'Kanpur': { lat: 26.4499, lon: 80.3319 },
  'Nagpur': { lat: 21.1458, lon: 79.0882 },
  'Indore': { lat: 22.7196, lon: 75.8577 },
  'Thane': { lat: 19.2183, lon: 72.9781 },
  'Bhopal': { lat: 23.2599, lon: 77.4126 },
  'Visakhapatnam': { lat: 17.6868, lon: 83.2185 },
  'Pimpri-Chinchwad': { lat: 18.6298, lon: 73.7997 },
  'Patna': { lat: 25.5941, lon: 85.1376 },
  'Vadodara': { lat: 22.3072, lon: 73.1812 },
  'Ghaziabad': { lat: 28.6692, lon: 77.4538 },
  'Ludhiana': { lat: 30.9010, lon: 75.8573 },
  'Agra': { lat: 27.1767, lon: 78.0081 },
  'Nashik': { lat: 19.9975, lon: 73.7898 },
  'Faridabad': { lat: 28.4089, lon: 77.3178 },
  'Meerut': { lat: 28.9845, lon: 77.7064 },
  'Rajkot': { lat: 22.3039, lon: 70.8022 },
  'Varanasi': { lat: 25.3176, lon: 82.9739 },
  'Srinagar': { lat: 34.0837, lon: 74.7973 },
  'Aurangabad': { lat: 19.8762, lon: 75.3433 },
  'Dhanbad': { lat: 23.7957, lon: 86.4304 },
  'Amritsar': { lat: 31.6340, lon: 74.8723 },
  'Allahabad': { lat: 25.4358, lon: 81.8463 },
  'Prayagraj': { lat: 25.4358, lon: 81.8463 },
  'Ranchi': { lat: 23.3441, lon: 85.3096 },
  'Howrah': { lat: 22.5958, lon: 88.2636 },
  'Coimbatore': { lat: 11.0168, lon: 76.9558 },
  'Jabalpur': { lat: 23.1815, lon: 79.9864 },
  'Gwalior': { lat: 26.2183, lon: 78.1828 },
  'Vijayawada': { lat: 16.5062, lon: 80.6480 },
  'Jodhpur': { lat: 26.2389, lon: 73.0243 },
  'Madurai': { lat: 9.9252, lon: 78.1198 },
  'Raipur': { lat: 21.2514, lon: 81.6296 },
  'Kota': { lat: 25.2138, lon: 75.8648 },
  'Chandigarh': { lat: 30.7333, lon: 76.7794 },
  'Guwahati': { lat: 26.1445, lon: 91.7362 },
  'Solapur': { lat: 17.6599, lon: 75.9064 },
  'Hubli': { lat: 15.3647, lon: 75.1240 },
  'Mysore': { lat: 12.2958, lon: 76.6394 },
  'Tiruchirappalli': { lat: 10.7905, lon: 78.7047 },
  'Bareilly': { lat: 28.3670, lon: 79.4304 },
  'Aligarh': { lat: 27.8974, lon: 78.0880 },
  'Moradabad': { lat: 28.8386, lon: 78.7733 },
  'Jalandhar': { lat: 31.3260, lon: 75.5762 },
  'Bhubaneswar': { lat: 20.2961, lon: 85.8245 },
  'Salem': { lat: 11.6643, lon: 78.1460 },
  'Warangal': { lat: 17.9784, lon: 79.5941 },
  'Guntur': { lat: 16.3067, lon: 80.4365 },
  'Bhiwandi': { lat: 19.2967, lon: 73.0631 },
  'Saharanpur': { lat: 29.9680, lon: 77.5510 },
  'Gorakhpur': { lat: 26.7606, lon: 83.3732 },
  'Bikaner': { lat: 28.0229, lon: 73.3119 },
  'Amravati': { lat: 20.9374, lon: 77.7796 },
  'Noida': { lat: 28.5355, lon: 77.3910 },
  'Jamshedpur': { lat: 22.8046, lon: 86.2029 },
  'Bhilai': { lat: 21.1938, lon: 81.3509 },
  'Cuttack': { lat: 20.4625, lon: 85.8830 },
  'Firozabad': { lat: 27.1591, lon: 78.3957 },
  'Kochi': { lat: 9.9312, lon: 76.2673 },
  'Navi Mumbai': { lat: 19.0330, lon: 73.0297 },
  'Dehradun': { lat: 30.3165, lon: 78.0322 },
  'Durgapur': { lat: 23.5204, lon: 87.3119 },
  'Asansol': { lat: 23.6739, lon: 86.9524 },
  'Nanded': { lat: 19.1383, lon: 77.3210 },
  'Kolhapur': { lat: 16.7050, lon: 74.2433 },
  'Ajmer': { lat: 26.4499, lon: 74.6399 },
  'Gulbarga': { lat: 17.3297, lon: 76.8343 },
  'Jamnagar': { lat: 22.4707, lon: 70.0577 },
  'Ujjain': { lat: 23.1765, lon: 75.7885 },
  'Loni': { lat: 28.7333, lon: 77.2833 },
  'Siliguri': { lat: 26.7271, lon: 88.3953 },
  'Jhansi': { lat: 25.4484, lon: 78.5685 },
  'Ulhasnagar': { lat: 19.2167, lon: 73.1667 },
  'Jammu': { lat: 32.7266, lon: 74.8570 },
  'Sangli-Miraj': { lat: 16.8524, lon: 74.5815 },
  'Mangalore': { lat: 12.9141, lon: 74.8560 },
  'Erode': { lat: 11.3410, lon: 77.7172 },
  'Belgaum': { lat: 15.8497, lon: 74.4977 },
  'Ambattur': { lat: 13.1143, lon: 80.1548 },
  'Tirunelveli': { lat: 8.7139, lon: 77.7567 },
  'Malegaon': { lat: 20.5579, lon: 74.5089 },
  'Gaya': { lat: 24.7955, lon: 85.0002 },
  'Jalgaon': { lat: 21.0077, lon: 75.5626 },
  'Udaipur': { lat: 24.5854, lon: 73.7125 },
  'Maheshtala': { lat: 22.5127, lon: 88.2627 },
};

/** Haversine distance in km between two lat/lon points */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async findAllCities(): Promise<City[]> {
    return this.cityRepository.find({ order: { name: 'ASC' } });
  }

  async findAreasByCity(cityId: string): Promise<Area[]> {
    const city = await this.cityRepository.findOne({ where: { id: cityId } });
    if (!city) {
      throw new NotFoundException(`City with ID ${cityId} not found`);
    }
    return this.areaRepository.find({ where: { cityId }, order: { name: 'ASC' } });
  }

  /**
   * Detect the nearest city from coordinates using Haversine distance.
   * Matches against known coordinates for major Indian cities.
   */
  async detectCity(lat: number, lon: number): Promise<City> {
    const cities = await this.cityRepository.find();

    if (cities.length === 0) {
      throw new NotFoundException('No cities available in database.');
    }

    let bestCity: City | null = null;
    let bestDistance = Infinity;

    for (const city of cities) {
      const coords = CITY_COORDINATES[city.name];
      if (!coords) continue;

      const dist = haversineDistance(lat, lon, coords.lat, coords.lon);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestCity = city;
      }
    }

    // Fall back to first city if none matched the coordinates map
    if (!bestCity) {
      bestCity = cities[0];
    }

    return bestCity;
  }
}
