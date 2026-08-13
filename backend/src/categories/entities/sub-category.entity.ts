import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ParentCategory } from './parent-category.entity';
import { LeafCategory } from './leaf-category.entity';

@Entity('sub_categories')
export class SubCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  parentId: string;

  @ManyToOne(() => ParentCategory, (parent) => parent.subCategories)
  @JoinColumn({ name: 'parentId' })
  parent: ParentCategory;

  @OneToMany(() => LeafCategory, (leafCategory) => leafCategory.subCategory)
  leafCategories: LeafCategory[];
}
