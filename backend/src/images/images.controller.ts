import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../auth/guards';
import { multerConfig } from './config/multer.config';
import { Image } from './entities';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { join } from 'path';

class AssociateImageDto {
  @IsString()
  url: string;

  @IsString()
  adId: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}

@ApiTags('images')
@Controller('images')
export class ImagesController {
  private readonly logger = new Logger(ImagesController.name);

  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Image> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.logger.log(`Uploading image: ${file.originalname}`);
    return this.imagesService.uploadImage(file);
  }

  @Post('associate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Associate an uploaded image with an ad' })
  async associateImage(@Body() dto: AssociateImageDto): Promise<Image> {
    return this.imagesService.associateImageWithAd(dto.url, dto.adId, dto.order ?? 0);
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Get image file' })
  async getImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const filePath = join(process.cwd(), 'uploads', 'images', filename);
      this.logger.log(`Serving image: ${filename}`);
      res.sendFile(filePath);
    } catch (error) {
      this.logger.error(`Failed to serve image: ${error.message}`);
      throw new BadRequestException('Image not found');
    }
  }
}
