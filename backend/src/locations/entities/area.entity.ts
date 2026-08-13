import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { City } from './city.entity';
import { Ad } from '../../ads/entities/ad.entity';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => City, (city) => city.areas)
  city: City;

  @Column()
  cityId: string;

  @OneToMany(() => Ad, (ad) => ad.area)
  ads: Ad[];
}
