import {
  Controller,
  Get,
  Param,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { GetUserId } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get chat session by ID' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSession(@Param('sessionId') sessionId: string) {
    return this.chatService.getSession(sessionId);
  }

  @Get('sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Get all messages from a session' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSessionMessages(@Param('sessionId') sessionId: string) {
    return this.chatService.getSessionMessages(sessionId);
  }

  @Get('flows/:flowId/sessions')
  @ApiOperation({ summary: 'Get all chat sessions for a flow' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFlowSessions(
    @Param('flowId') flowId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.chatService.getFlowSessions(flowId, +page, +limit);
  }

  @Get('flows/:flowId/analytics')
  @ApiOperation({ summary: 'Get chat analytics for a flow' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getFlowAnalytics(@Param('flowId') flowId: string) {
    return this.chatService.getFlowAnalytics(flowId);
  }

  @Get('user/sessions')
  @ApiOperation({ summary: 'Get all chat sessions for current user' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserSessions(
    @GetUserId() userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.chatService.getUserSessions(userId, +page, +limit);
  }

  @Get('stats')
  @Roles('admin')
  @ApiOperation({ summary: 'Get overall chat statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getOverallStats() {
    return this.chatService.getOverallStats();
  }

  @Delete('cleanup')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete old chat sessions (Admin only)' })
  @ApiResponse({ status: 200, description: 'Old sessions deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Delete sessions older than this many days (default: 30)' })
  async deleteOldSessions(@Query('days') days: number = 30) {
    return this.chatService.deleteOldSessions(+days);
  }
}
