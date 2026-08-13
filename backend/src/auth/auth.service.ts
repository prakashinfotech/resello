import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Check if a user exists by email or phone
   */
  async checkUserExists(identifier: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: [{ email: identifier }, { phone: identifier }],
    });
    return !!user;
  }

  /**
   * Register a new user
   */
  async register(
    registerDto: RegisterDto,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const { identifier, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email: identifier }, { phone: identifier }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Determine if identifier is email or phone
    const isEmail = identifier.includes('@');
    const isPhone = /^\d{10}$/.test(identifier);

    if (!isEmail && !isPhone) {
      throw new BadRequestException(
        'Identifier must be a valid email or 10-digit phone number',
      );
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = this.userRepository.create({
      email: isEmail ? identifier : `${identifier}@temp.com`, // Temporary email for phone-based registration
      phone: isPhone ? identifier : '0000000000', // Temporary phone for email-based registration
      password: hashedPassword,
      name,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload = { sub: savedUser.id, email: savedUser.email };
    const access_token = this.jwtService.sign(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  /**
   * Login user
   */
  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const { identifier, password } = loginDto;

    // Validate user credentials
    const user = await this.validateUser(identifier, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  /**
   * Validate user credentials
   */
  async validateUser(identifier: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: [{ email: identifier }, { phone: identifier }],
      select: ['id', 'email', 'password', 'name', 'phone', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
