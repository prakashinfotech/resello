import {
  IsString,
  IsNumber,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdDto {
  @ApiProperty({
    description: 'Ad title',
    example: 'iPhone 13 Pro Max 256GB',
    minLength: 10,
    maxLength: 100,
  })
  @IsString()
  @MinLength(10, { message: 'Title must be at least 10 characters long' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @ApiProperty({
    description: 'Ad description',
    example:
      'Brand new iPhone 13 Pro Max with 256GB storage. Comes with original box and accessories. Never used, sealed pack.',
    minLength: 50,
    maxLength: 5000,
  })
  @IsString()
  @MinLength(50, { message: 'Description must be at least 50 characters long' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description: string;

  @ApiProperty({
    description: 'Ad price in rupees',
    example: 95000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({
    description: 'Leaf category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId: string;

  @ApiProperty({
    description: 'City ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4', { message: 'City ID must be a valid UUID' })
  cityId: string;

  @ApiProperty({
    description: 'Area ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID('4', { message: 'Area ID must be a valid UUID' })
  areaId: string;
}
