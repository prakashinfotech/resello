import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentCategory, SubCategory, LeafCategory } from './entities';

export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subCategories: {
    id: string;
    name: string;
    slug: string;
    leafCategories: {
      id: string;
      name: string;
      slug: string;
    }[];
  }[];
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(ParentCategory)
    private readonly parentCategoryRepository: Repository<ParentCategory>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(LeafCategory)
    private readonly leafCategoryRepository: Repository<LeafCategory>,
  ) {}

  /**
   * Get all categories in a hierarchical tree structure
   * Returns parent categories with nested sub-categories and leaf categories
   */
  async findAll(): Promise<CategoryTree[]> {
    const parentCategories = await this.parentCategoryRepository.find({
      relations: ['subCategories', 'subCategories.leafCategories'],
      order: {
        name: 'ASC',
        subCategories: {
          name: 'ASC',
          leafCategories: {
            name: 'ASC',
          },
        },
      },
    });

    return parentCategories.map((parent) => ({
      id: parent.id,
      name: parent.name,
      slug: parent.slug,
      icon: parent.icon,
      subCategories: parent.subCategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        leafCategories: sub.leafCategories.map((leaf) => ({
          id: leaf.id,
          name: leaf.name,
          slug: leaf.slug,
        })),
      })),
    }));
  }

  /**
   * Get all parent categories
   */
  async findParentCategories(): Promise<ParentCategory[]> {
    return this.parentCategoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Get sub-categories by parent category ID
   */
  async findSubCategories(parentId: string): Promise<SubCategory[]> {
    // Verify parent category exists
    const parentExists = await this.parentCategoryRepository.findOne({
      where: { id: parentId },
    });

    if (!parentExists) {
      throw new NotFoundException(
        `Parent category with ID ${parentId} not found`,
      );
    }

    return this.subCategoryRepository.find({
      where: { parentId },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get leaf categories by sub-category ID
   */
  async findLeafCategories(subCategoryId: string): Promise<LeafCategory[]> {
    // Verify sub-category exists
    const subCategoryExists = await this.subCategoryRepository.findOne({
      where: { id: subCategoryId },
    });

    if (!subCategoryExists) {
      throw new NotFoundException(
        `Sub-category with ID ${subCategoryId} not found`,
      );
    }

    return this.leafCategoryRepository.find({
      where: { subCategoryId },
      order: { name: 'ASC' },
    });
  }
}
