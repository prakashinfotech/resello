import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { DetectCityDto } from './dto';
import { City, Area } from './entities';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('cities')
  @ApiOperation({ summary: 'Get all cities' })
  @ApiResponse({
    status: 200,
    description: 'Returns all cities with their state information',
    type: [City],
  })
  async findAllCities(): Promise<City[]> {
    return this.locationsService.findAllCities();
  }

  @Get('cities/:id/areas')
  @ApiOperation({ summary: 'Get areas by city' })
  @ApiParam({
    name: 'id',
    description: 'City UUID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all areas for the specified city',
    type: [Area],
  })
  @ApiResponse({
    status: 404,
    description: 'City not found',
  })
  async findAreasByCity(@Param('id') cityId: string): Promise<Area[]> {
    return this.locationsService.findAreasByCity(cityId);
  }

  @Post('detect')
  @ApiOperation({ summary: 'Detect city from coordinates' })
  @ApiResponse({
    status: 200,
    description: 'Returns the detected city based on coordinates',
    type: City,
  })
  @ApiResponse({
    status: 404,
    description: 'Unable to detect city from coordinates',
  })
  async detectCity(@Body() detectCityDto: DetectCityDto): Promise<City> {
    return this.locationsService.detectCity(
      detectCityDto.lat,
      detectCityDto.lon,
    );
  }
}
