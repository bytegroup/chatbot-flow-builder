import {Controller, Get, Body, Param, Delete, Query, Put} from '@nestjs/common';
import { UsersService } from './users.service';
import {ApiOperation, ApiQuery, ApiResponse} from "@nestjs/swagger";
import {UserDto} from "./dto/user.dto";
import {Roles} from "../auth/decorators/roles.decorator";
import {Public} from "../auth/decorators/public.decorator";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @Public()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findAll(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
  ): Promise<{ users: UserDto[]; total: number; page: number; totalPages: number }> {
    return this.usersService.findAll(+page, +limit);
  }

  @Get('stats')
  @Roles('admin')
  async getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id/role')
  @Roles('admin')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(id, role);
  }

  @Delete(':id')
  @Roles('admin')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}
