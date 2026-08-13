import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities';
import { ConfigService } from '@nestjs/config';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);
  private readonly uploadsDir = './uploads/images';

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Upload and save image
   */
  async uploadImage(
    file: Express.Multer.File,
    adId?: string,
    order: number = 0,
  ): Promise<Image> {
    // Validate image
    this.validateImage(file);

    // Generate URL for the image — served via static assets at /uploads/images/
    const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:4000';
    const url = `${baseUrl}/uploads/images/${file.filename}`;

    // Create image record
    const image = this.imageRepository.create({
      filename: file.filename,
      path: file.path,
      url,
      adId,
      order,
    });

    const savedImage = await this.imageRepository.save(image);
    this.logger.log(`Image uploaded successfully: ${savedImage.id}`);

    return savedImage;
  }

  /**
   * Validate image format and size
   */
  validateImage(file: Express.Multer.File): void {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Validate file type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      );
    }

    // Validate file size
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size exceeds the maximum limit of 5MB.',
      );
    }

    this.logger.log(`Image validation passed: ${file.filename}`);
  }

  /**
   * Delete image by ID
   */
  async deleteImage(id: string): Promise<void> {
    const image = await this.imageRepository.findOne({ where: { id } });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    try {
      // Delete file from filesystem
      const filePath = join(process.cwd(), image.path);
      await unlink(filePath);
      this.logger.log(`Image file deleted: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to delete image file: ${error.message}`);
      // Continue with database deletion even if file deletion fails
    }

    // Delete database record
    await this.imageRepository.remove(image);
    this.logger.log(`Image record deleted: ${id}`);
  }

  /**
   * Find image by ID
   */
  async findById(id: string): Promise<Image> {
    const image = await this.imageRepository.findOne({ where: { id } });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return image;
  }

  /**
   * Find images by ad ID
   */
  async findByAdId(adId: string): Promise<Image[]> {
    return this.imageRepository.find({
      where: { adId },
      order: { order: 'ASC' },
    });
  }

  /**
   * Associate an already-uploaded image (by URL) with an ad
   */
  async associateImageWithAd(url: string, adId: string, order: number = 0): Promise<Image> {
    const image = await this.imageRepository.findOne({ where: { url } });
    if (!image) {
      throw new NotFoundException(`Image with URL not found`);
    }
    image.adId = adId;
    image.order = order;
    const saved = await this.imageRepository.save(image);
    this.logger.log(`Image ${saved.id} associated with ad ${adId}`);
    return saved;
  }

  /**
   * Delete images by ad ID (cascade cleanup)
   */
  async deleteByAdId(adId: string): Promise<void> {
    const images = await this.findByAdId(adId);

    for (const image of images) {
      await this.deleteImage(image.id);
    }

    this.logger.log(`All images deleted for ad: ${adId}`);
  }
}
