import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SubCategory } from './sub-category.entity';

@Entity('parent_categories')
export class ParentCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  icon: string;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.parent)
  subCategories: SubCategory[];
}
