import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Ad } from '../ads/entities/ad.entity';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Ad)
    private readonly adRepository: Repository<Ad>,
  ) {}

  /**
   * Find user by ID
   * @param id - User UUID
   * @returns User entity
   * @throws NotFoundException if user not found
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  /**
   * Find user by email
   * @param email - User email address
   * @returns User entity or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Find user by phone number
   * @param phone - User phone number
   * @returns User entity or null if not found
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  /**
   * Update user profile
   * Email updates are excluded as per requirements
   * @param id - User UUID
   * @param updateUserDto - Update data (name and/or phone)
   * @returns Updated user entity
   * @throws NotFoundException if user not found
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    
    // Update only allowed fields (name and phone)
    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }
    
    if (updateUserDto.phone !== undefined) {
      user.phone = updateUserDto.phone;
    }
    
    return this.userRepository.save(user);
  }

  /**
   * Get all ads posted by a user
   * @param userId - User UUID
   * @returns Array of ads with images (including inactive)
   */
  async getUserAds(userId: string): Promise<Ad[]> {
    // Verify user exists
    await this.findById(userId);

    return this.adRepository.find({
      where: { userId },
      relations: ['category', 'city', 'area', 'images'],
      order: { createdAt: 'DESC' },
    });
  }
}
