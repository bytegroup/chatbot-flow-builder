import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema, Types} from 'mongoose';

export type ChatSessionDocument = HydratedDocument<ChatSession>;

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  nodeId?: string; // Which node generated this message
  metadata?: Record<string, any>;
}

@Schema({ timestamps: true })
export class ChatSession {
  @Prop({ required: true, unique: true, index: true })
  sessionId: string; // UUID for session tracking

  @Prop({
    type: Types.ObjectId,
    ref: 'Flow',
    required: true,
    index: true,
  })
  flowId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    index: true,
  })
  userId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['active', 'completed', 'abandoned', 'error'],
    default: 'active',
    index: true,
  })
  status: 'active' | 'completed' | 'abandoned' | 'error';

  @Prop({
    type: [
      {
        id: String,
        role: {
          type: String,
          enum: ['user', 'bot', 'system'],
          required: true,
        },
        content: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        nodeId: String,
        metadata: MongooseSchema.Types.Mixed,
      },
    ],
    default: [],
  })
  messages: ChatMessage[];

  @Prop({ type: String })
  currentNodeId?: string; // Current position in flow

  @Prop({
    type: Map,
    of: MongooseSchema.Types.Mixed,
    default: {},
  })
  variables: Map<string, any>; // Flow variables stored during execution

  @Prop({ type: Date, default: Date.now, index: true })
  startedAt: Date;

  @Prop({ type: Date })
  endedAt?: Date;

  @Prop({ type: Number }) // In seconds
  duration?: number;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);

// Indexes for performance
ChatSessionSchema.index({ flowId: 1, startedAt: -1 });
ChatSessionSchema.index({ userId: 1, startedAt: -1 });
ChatSessionSchema.index({ status: 1, startedAt: -1 });

// Calculate duration on save
ChatSessionSchema.pre('save', function () {
  if (this.endedAt && this.startedAt) {
    this.duration = Math.floor(
      (this.endedAt.getTime() - this.startedAt.getTime()) / 1000,
    );
  }
});

// TTL index - auto-delete sessions after 30 days
ChatSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export { ChatSessionSchema };
