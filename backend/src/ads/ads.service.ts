import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ad } from './entities/ad.entity';
import { CreateAdDto, UpdateAdDto, FindAdsDto, SortBy } from './dto';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Ad)
    private readonly adRepository: Repository<Ad>,
  ) {}

  /**
   * Create a new ad
   * Sets userId, isActive=true, and stores timestamp automatically
   * @param userId - ID of the user creating the ad
   * @param createAdDto - Ad creation data
   * @returns Created ad entity
   */
  async create(userId: string, createAdDto: CreateAdDto): Promise<Ad> {
    const ad = this.adRepository.create({
      ...createAdDto,
      userId,
      isActive: true,
      views: 0,
    });

    return this.adRepository.save(ad);
  }

  /**
   * Find all ads with pagination and filters
   * @param query - Filter and pagination parameters
   * @returns Paginated response with ads
   */
  async findAll(query: FindAdsDto): Promise<PaginatedResponse<Ad>> {
    const {
      categoryId,
      parentCategoryId,
      subCategoryId,
      cityId,
      areaId,
      minPrice,
      maxPrice,
      search,
      sortBy = SortBy.NEWEST,
      page = 1,
      limit = 20,
    } = query;

    // Build query builder for complex filters
    const queryBuilder = this.adRepository
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.user', 'user')
      .leftJoinAndSelect('ad.category', 'category')
      .leftJoinAndSelect('category.subCategory', 'subCategory')
      .leftJoinAndSelect('subCategory.parent', 'parentCategory')
      .leftJoinAndSelect('ad.city', 'city')
      .leftJoinAndSelect('ad.area', 'area')
      .leftJoinAndSelect('ad.images', 'images')
      .where('ad.isActive = :isActive', { isActive: true });

    // Filter by exact leaf category
    if (categoryId) {
      queryBuilder.andWhere('ad.categoryId = :categoryId', { categoryId });
    }

    // Filter by parent category — matches all leaf categories under this parent
    if (parentCategoryId) {
      queryBuilder.andWhere('parentCategory.id = :parentCategoryId', { parentCategoryId });
    }

    // Filter by sub-category — matches all leaf categories under this sub-category
    if (subCategoryId) {
      queryBuilder.andWhere('subCategory.id = :subCategoryId', { subCategoryId });
    }

    if (cityId) {
      queryBuilder.andWhere('ad.cityId = :cityId', { cityId });
    }

    if (areaId) {
      queryBuilder.andWhere('ad.areaId = :areaId', { areaId });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('ad.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('ad.price <= :maxPrice', { maxPrice });
    }

    // Search in title and description (case-insensitive)
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(ad.title) LIKE LOWER(:search) OR LOWER(ad.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    switch (sortBy) {
      case SortBy.NEWEST:
        queryBuilder.orderBy('ad.createdAt', 'DESC');
        break;
      case SortBy.OLDEST:
        queryBuilder.orderBy('ad.createdAt', 'ASC');
        break;
      case SortBy.PRICE_ASC:
        queryBuilder.orderBy('ad.price', 'ASC');
        break;
      case SortBy.PRICE_DESC:
        queryBuilder.orderBy('ad.price', 'DESC');
        break;
      default:
        queryBuilder.orderBy('ad.createdAt', 'DESC');
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find ad by ID
   * @param id - Ad UUID
   * @returns Ad entity with relations
   * @throws NotFoundException if ad not found
   */
  async findById(id: string): Promise<Ad> {
    const ad = await this.adRepository.findOne({
      where: { id },
      relations: [
        'user',
        'category',
        'category.subCategory',
        'category.subCategory.parent',
        'city',
        'area',
        'images',
      ],
    });

    if (!ad) {
      throw new NotFoundException(`Ad with ID ${id} not found`);
    }

    return ad;
  }

  /**
   * Update an ad
   * Checks ownership and updates timestamp automatically
   * @param id - Ad UUID
   * @param userId - ID of the user attempting to update
   * @param updateAdDto - Update data
   * @returns Updated ad entity
   * @throws NotFoundException if ad not found
   * @throws ForbiddenException if user is not the owner
   */
  async update(
    id: string,
    userId: string,
    updateAdDto: UpdateAdDto,
  ): Promise<Ad> {
    const ad = await this.findById(id);

    // Check ownership
    if (ad.userId !== userId) {
      throw new ForbiddenException('You can only update your own ads');
    }

    // Update fields
    Object.assign(ad, updateAdDto);

    // updatedAt will be automatically updated by TypeORM
    return this.adRepository.save(ad);
  }

  /**
   * Soft delete an ad
   * Sets isActive to false instead of deleting the record
   * @param id - Ad UUID
   * @param userId - ID of the user attempting to delete
   * @throws NotFoundException if ad not found
   * @throws ForbiddenException if user is not the owner
   */
  async softDelete(id: string, userId: string): Promise<void> {
    const ad = await this.findById(id);

    // Check ownership
    if (ad.userId !== userId) {
      throw new ForbiddenException('You can only delete your own ads');
    }

    // Soft delete by setting isActive to false
    ad.isActive = false;
    await this.adRepository.save(ad);
  }

  /**
   * Increment view count for an ad
   * @param id - Ad UUID
   * @throws NotFoundException if ad not found
   */
  async incrementViews(id: string): Promise<void> {
    const ad = await this.findById(id);

    ad.views += 1;
    await this.adRepository.save(ad);
  }
}
