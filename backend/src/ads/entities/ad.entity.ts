import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LeafCategory } from '../../categories/entities/leaf-category.entity';
import { City } from '../../locations/entities/city.entity';
import { Area } from '../../locations/entities/area.entity';

@Entity('ads')
export class Ad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => User, (user) => user.ads)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => LeafCategory, (category) => category.ads)
  @JoinColumn({ name: 'categoryId' })
  category: LeafCategory;

  @Column()
  categoryId: string;

  @ManyToOne(() => City, (city) => city.ads)
  @JoinColumn({ name: 'cityId' })
  city: City;

  @Column()
  cityId: string;

  @ManyToOne(() => Area, (area) => area.ads)
  @JoinColumn({ name: 'areaId' })
  area: Area;

  @Column()
  areaId: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('Image', 'ad')
  images: any[];
}
