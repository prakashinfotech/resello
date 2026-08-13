import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { SubCategory } from './sub-category.entity';
import { Ad } from '../../ads/entities/ad.entity';

@Entity('leaf_categories')
export class LeafCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  subCategoryId: string;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.leafCategories)
  @JoinColumn({ name: 'subCategoryId' })
  subCategory: SubCategory;

  @OneToMany(() => Ad, (ad) => ad.category)
  ads: Ad[];
}
