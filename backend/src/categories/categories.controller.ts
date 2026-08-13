import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService, CategoryTree } from './categories.service';
import { ParentCategory, SubCategory, LeafCategory } from './entities';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * GET /categories
   * Get all categories in hierarchical tree structure
   */
  @Get()
  async findAll(): Promise<CategoryTree[]> {
    return this.categoriesService.findAll();
  }

  /**
   * GET /categories/parent
   * Get all parent categories
   */
  @Get('parent')
  async findParentCategories(): Promise<ParentCategory[]> {
    return this.categoriesService.findParentCategories();
  }

  /**
   * GET /categories/parent/:id/sub
   * Get sub-categories by parent category ID
   */
  @Get('parent/:id/sub')
  async findSubCategories(@Param('id') parentId: string): Promise<SubCategory[]> {
    return this.categoriesService.findSubCategories(parentId);
  }

  /**
   * GET /categories/sub/:id/leaf
   * Get leaf categories by sub-category ID
   */
  @Get('sub/:id/leaf')
  async findLeafCategories(@Param('id') subCategoryId: string): Promise<LeafCategory[]> {
    return this.categoriesService.findLeafCategories(subCategoryId);
  }
}
