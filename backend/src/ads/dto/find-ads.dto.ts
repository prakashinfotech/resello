import {
  IsOptional,
  IsUUID,
  IsNumber,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
}

export class FindAdsDto {
  @ApiPropertyOptional({
    description: 'Filter by leaf category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by parent category ID (returns all ads under this parent)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Parent category ID must be a valid UUID' })
  parentCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by sub-category ID (returns all ads under this sub-category)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Sub-category ID must be a valid UUID' })
  subCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by city ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'City ID must be a valid UUID' })
  cityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by area ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Area ID must be a valid UUID' })
  areaId?: string;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum price must be a valid number' })
  @Min(0, { message: 'Minimum price must be a positive number' })
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 50000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum price must be a valid number' })
  @Min(0, { message: 'Maximum price must be a positive number' })
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Search query for title and description',
    example: 'iPhone',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortBy,
    default: SortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(SortBy, { message: 'Sort by must be one of: newest, oldest, price_asc, price_desc' })
  sortBy?: SortBy = SortBy.NEWEST;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 20;
}
