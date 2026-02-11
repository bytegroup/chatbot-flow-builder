import {Injectable, NotFoundException} from '@nestjs/common';
import {userListToUserDtoList, userToUserDto} from "../utils/DtoMapper";
import {UserDto} from "./dto/user.dto";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {User, UserDocument} from "./schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserDto> {
    const user = await this.userModel.findById(id).select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return userToUserDto(user);
  }

  /**
   * Get all users (admin only)
   */
  async findAll(
      page: number = 1,
      limit: number = 10,
  ): Promise<{ users: UserDto[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
          .find()
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
      this.userModel.countDocuments(),
    ]);

    return {
      users: userListToUserDtoList(users),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update user role (admin only)
   */
  async updateRole(userId: string, role: string): Promise<UserDto> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    await user.save();

    return userToUserDto(user);
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(userId);

    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const [totalUsers, adminUsers, verifiedUsers] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ role: 'admin' }),
      this.userModel.countDocuments({ emailVerified: true }),
    ]);

    const recentUsers = await this.userModel
        .find()
        .select('name email createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

    return {
      totalUsers,
      adminUsers,
      verifiedUsers,
      recentUsers,
    };
  }
}
