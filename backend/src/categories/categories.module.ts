import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ParentCategory, SubCategory, LeafCategory } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParentCategory, SubCategory, LeafCategory]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
