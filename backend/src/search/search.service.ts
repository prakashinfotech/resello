import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ad } from '../ads/entities/ad.entity';
import { FindAdsDto, SortBy } from '../ads/dto';

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
export class SearchService {
  constructor(
    @InjectRepository(Ad)
    private readonly adRepository: Repository<Ad>,
  ) {}

  /**
   * Search ads with case-insensitive text matching and filters
   * @param query - Search and filter parameters
   * @returns Paginated response with matching ads
   */
  async search(query: FindAdsDto): Promise<PaginatedResponse<Ad>> {
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

    // Apply category filter
    if (categoryId) {
      queryBuilder.andWhere('ad.categoryId = :categoryId', { categoryId });
    }

    if (parentCategoryId) {
      queryBuilder.andWhere('parentCategory.id = :parentCategoryId', { parentCategoryId });
    }

    if (subCategoryId) {
      queryBuilder.andWhere('subCategory.id = :subCategoryId', { subCategoryId });
    }

    // Apply location filters
    if (cityId) {
      queryBuilder.andWhere('ad.cityId = :cityId', { cityId });
    }

    if (areaId) {
      queryBuilder.andWhere('ad.areaId = :areaId', { areaId });
    }

    // Apply price range filters
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
   * Get autocomplete suggestions based on ad titles
   * @param term - Search term
   * @returns Array of suggested search terms
   */
  async autocomplete(term: string): Promise<string[]> {
    if (!term || term.trim().length === 0) {
      return [];
    }

    // Search for ads with matching titles (case-insensitive)
    const ads = await this.adRepository
      .createQueryBuilder('ad')
      .select('ad.title', 'title')
      .where('ad.isActive = :isActive', { isActive: true })
      .andWhere('LOWER(ad.title) LIKE LOWER(:term)', { term: `%${term}%` })
      .distinct(true)
      .limit(10)
      .getRawMany();

    return ads.map((ad) => ad.title);
  }
}
