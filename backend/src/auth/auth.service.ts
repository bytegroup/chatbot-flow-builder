import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {JwtService, JwtSignOptions} from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import {AuthResponseDto, UserResponseDto} from "./dto/response.dto";
import {plainToInstance} from "class-transformer";
import {UserDto} from "../users/dto/user.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, avatar } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = new this.userModel({
      email,
      password,
      name,
      avatar,
      role: 'user',
      emailVerified: false,
      settings: {
        theme: 'light',
        autoSave: true,
        autoSaveInterval: 30,
      },
    });

    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        ...user.toJSON(),
        _id: user._id.toString(), // ✅ convert ObjectId to string
      } as UserResponseDto,
    };
  }

  /**
   * Login user
   */
  async login(user: UserDocument, deviceInfo?: any) {
    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user, deviceInfo);

    return {
      ...tokens,
      user: plainToInstance(UserResponseDto, user.toObject(), {
        excludeExtraneousValues: true,
      }),
    };
  }

  /**
   * Validate user credentials (used by LocalStrategy)
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user: UserDocument, deviceInfo?: any) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload as object, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRES_IN') ?? '15m',
    } as JwtSignOptions);

    // Generate refresh token
    const refreshTokenString = uuidv4();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(
      refreshTokenExpiry.getDate() +
        parseInt(
          this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7',
        ),
    );

    // Hash refresh token before storing
    const hashedRefreshToken = await bcrypt.hash(refreshTokenString, 10);

    // Store refresh token in database
    const refreshToken = new this.refreshTokenModel({
      userId: user._id,
      token: hashedRefreshToken,
      expiresAt: refreshTokenExpiry,
      deviceInfo,
    });

    await refreshToken.save();

    return {
      accessToken,
      refreshToken: refreshTokenString, // Send unhashed token to client
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshTokenString: string) {
    // Find all refresh tokens for potential matching
    const refreshTokens = await this.refreshTokenModel.find({
      expiresAt: { $gt: new Date() }, // Not expired
    });

    let validToken: RefreshTokenDocument | null = null;

    // Compare hashed tokens
    for (const token of refreshTokens) {
      const isValid = await bcrypt.compare(refreshTokenString, token.token);
      if (isValid) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Get user
    const user = await this.userModel.findById(validToken.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user);

    // Delete old refresh token
    await this.refreshTokenModel.findByIdAndDelete(validToken._id);

    return tokens;
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(refreshTokenString: string) {
    const refreshTokens = await this.refreshTokenModel.find();

    for (const token of refreshTokens) {
      const isValid = await bcrypt.compare(refreshTokenString, token.token);
      if (isValid) {
        await this.refreshTokenModel.findByIdAndDelete(token._id);
        return { message: 'Logged out successfully' };
      }
    }

    throw new BadRequestException('Invalid refresh token');
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.name) {
      user.name = updateProfileDto.name;
    }

    if (updateProfileDto.avatar) {
      user.avatar = updateProfileDto.avatar;
    }

    if (updateProfileDto.settings) {
      user.settings = {
        ...user.settings,
        ...updateProfileDto.settings,
      };
    }

    await user.save();

    return user.toJSON();
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(
      changePasswordDto.currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = changePasswordDto.newPassword;
    await user.save();

    // Invalidate all refresh tokens
    await this.refreshTokenModel.deleteMany({ userId: user._id});

    return { message: 'Password changed successfully' };
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete all refresh tokens
    await this.refreshTokenModel.deleteMany({ userId: user._id});

    // Delete user
    await this.userModel.findByIdAndDelete(userId);

    return { message: 'Account deleted successfully' };
  }

  /**
   * Clean up expired refresh tokens (can be run as a cron job)
   */
  async cleanupExpiredTokens() {
    const result = await this.refreshTokenModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    return {
      message: `Cleaned up ${result.deletedCount} expired tokens`,
    };
  }
}
