import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatSession, ChatSessionDocument } from './schemas/chat-session.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatSession.name)
    private chatSessionModel: Model<ChatSessionDocument>,
  ) {}

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<ChatSessionDocument | null> {
    return this.chatSessionModel.findOne({ sessionId });
  }

  /**
   * Get all sessions for a flow
   */
  async getFlowSessions(flowId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      this.chatSessionModel
        .find({ flowId })
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-messages') // Exclude messages for list view
        .lean(),
      this.chatSessionModel.countDocuments({ flowId }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      this.chatSessionModel
        .find({ userId })
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-messages')
        .lean(),
      this.chatSessionModel.countDocuments({ userId }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get session messages
   */
  async getSessionMessages(sessionId: string) {
    const session = await this.chatSessionModel.findOne({ sessionId });
    
    if (!session) {
      throw new Error('Session not found');
    }

    return session.messages;
  }

  /**
   * Get chat analytics for a flow
   */
  async getFlowAnalytics(flowId: string) {
    const [
      totalSessions,
      completedSessions,
      abandonedSessions,
      errorSessions,
    ] = await Promise.all([
      this.chatSessionModel.countDocuments({ flowId: flowId }),
      this.chatSessionModel.countDocuments({ flowId, status: 'completed' }),
      this.chatSessionModel.countDocuments({ flowId, status: 'abandoned' }),
      this.chatSessionModel.countDocuments({ flowId, status: 'error' }),
    ]);

    // Calculate average duration
    const sessions = await this.chatSessionModel
      .find({ flowId, duration: { $exists: true } })
      .select('duration');

    const avgDuration = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length
      : 0;

    // Get recent sessions
    const recentSessions = await this.chatSessionModel
      .find({ flowId })
      .sort({ startedAt: -1 })
      .limit(10)
      .select('sessionId status startedAt endedAt duration')
      .lean();

    return {
      totalSessions,
      completedSessions,
      abandonedSessions,
      errorSessions,
      activeSessions: totalSessions - completedSessions - abandonedSessions - errorSessions,
      completionRate:
        totalSessions > 0
          ? ((completedSessions / totalSessions) * 100).toFixed(2)
          : 0,
      averageDuration: Math.round(avgDuration),
      recentSessions,
    };
  }

  /**
   * Get overall chat statistics
   */
  async getOverallStats() {
    const [
      totalSessions,
      totalMessages,
      activeFlows,
    ] = await Promise.all([
      this.chatSessionModel.countDocuments(),
      this.chatSessionModel.aggregate([
        { $project: { messageCount: { $size: '$messages' } } },
        { $group: { _id: null, total: { $sum: '$messageCount' } } },
      ]),
      this.chatSessionModel.distinct('flowId'),
    ]);

    return {
      totalSessions,
      totalMessages: totalMessages[0]?.total || 0,
      activeFlows: activeFlows.length,
    };
  }

  /**
   * Delete old sessions (cleanup)
   */
  async deleteOldSessions(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.chatSessionModel.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return {
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} sessions older than ${daysOld} days`,
    };
  }
}
