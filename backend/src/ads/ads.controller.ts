import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AdsService, PaginatedResponse } from './ads.service';
import { CreateAdDto, UpdateAdDto, FindAdsDto } from './dto';
import { Ad } from './entities/ad.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  /**
   * Create a new ad (protected)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new ad' })
  @ApiResponse({
    status: 201,
    description: 'Ad created successfully',
    type: Ad,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req,
    @Body() createAdDto: CreateAdDto,
  ): Promise<Ad> {
    return this.adsService.create(req.user.id, createAdDto);
  }

  /**
   * Get all ads with filters and pagination
   */
  @Get()
  @ApiOperation({ summary: 'Get all ads with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Ads retrieved successfully',
  })
  async findAll(@Query() query: FindAdsDto): Promise<PaginatedResponse<Ad>> {
    return this.adsService.findAll(query);
  }

  /**
   * Get ad details by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get ad details by ID' })
  @ApiParam({ name: 'id', description: 'Ad UUID' })
  @ApiResponse({
    status: 200,
    description: 'Ad retrieved successfully',
    type: Ad,
  })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  async findById(@Param('id') id: string): Promise<Ad> {
    return this.adsService.findById(id);
  }

  /**
   * Update an ad (protected, ownership check)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an ad' })
  @ApiParam({ name: 'id', description: 'Ad UUID' })
  @ApiResponse({
    status: 200,
    description: 'Ad updated successfully',
    type: Ad,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateAdDto: UpdateAdDto,
  ): Promise<Ad> {
    return this.adsService.update(id, req.user.id, updateAdDto);
  }

  /**
   * Delete an ad (protected, ownership check)
   * Performs soft delete by setting isActive to false
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an ad (soft delete)' })
  @ApiParam({ name: 'id', description: 'Ad UUID' })
  @ApiResponse({ status: 204, description: 'Ad deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  async delete(@Param('id') id: string, @Request() req): Promise<void> {
    return this.adsService.softDelete(id, req.user.id);
  }

  /**
   * Increment view count for an ad
   */
  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Increment view count for an ad' })
  @ApiParam({ name: 'id', description: 'Ad UUID' })
  @ApiResponse({ status: 200, description: 'View count incremented' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  async incrementViews(@Param('id') id: string): Promise<{ message: string }> {
    await this.adsService.incrementViews(id);
    return { message: 'View count incremented successfully' };
  }
}
