import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema, Types} from 'mongoose';

export type FlowDocument = HydratedDocument<Flow>;

// Node data interfaces for different node types
export interface NodeData {
  label?: string;
  
  // Message node
  message?: string;
  richContent?: {
    type: 'text' | 'image' | 'link' | 'card';
    content: any;
  };
  
  // Input node
  inputType?: 'text' | 'number' | 'email' | 'choice';
  placeholder?: string;
  variableName?: string;
  validation?: {
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
  };
  choices?: string[]; // For choice type
  
  // Condition node
  conditions?: Array<{
    id: string;
    variable: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith';
    value: any;
    targetNodeId: string;
    label?: string;
  }>;
  defaultTarget?: string; // Fallback node if no conditions match
  
  // API node
  apiConfig?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    responseVariable?: string;
    timeout?: number;
  };
  
  // Delay node
  delay?: number; // in milliseconds
  displayMessage?: string;
  
  // Jump node
  targetNodeId?: string;
  
  // Common
  description?: string;
}

export interface Node {
  id: string; // UUID
  type: 'start' | 'end' | 'message' | 'input' | 'condition' | 'api' | 'delay' | 'jump';
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
  style?: Record<string, any>;
}

export interface Edge {
  id: string; // UUID
  source: string; // Source node ID
  target: string; // Target node ID
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  type?: 'default' | 'step' | 'smoothstep' | 'straight';
  animated?: boolean;
  style?: Record<string, any>;
}

export interface FlowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: any;
  description?: string;
}

@Schema({ timestamps: true })
export class Flow {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ type: String, maxlength: 500 })
  description?: string;

  @Prop({
    type: String,
    enum: ['draft', 'active', 'inactive'],
    default: 'draft',
    index: true,
  })
  status: 'draft' | 'active' | 'inactive';

  // Flow canvas data
  @Prop({
    type: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: ['start', 'end', 'message', 'input', 'condition', 'api', 'delay', 'jump'],
          required: true,
        },
        position: {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
        },
        data: {
          type: MongooseSchema.Types.Mixed,
          required: true,
        },
        style: MongooseSchema.Types.Mixed,
      },
    ],
    default: [],
  })
  nodes: Node[];

  @Prop({
    type: [
      {
        id: { type: String, required: true },
        source: { type: String, required: true },
        target: { type: String, required: true },
        sourceHandle: String,
        targetHandle: String,
        label: String,
        type: String,
        animated: Boolean,
        style: MongooseSchema.Types.Mixed,
      },
    ],
    default: [],
  })
  edges: Edge[];

  // Canvas viewport state
  @Prop({
    type: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      zoom: { type: Number, default: 1 },
    },
    default: { x: 0, y: 0, zoom: 1 },
  })
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };

  // Flow-level variables
  @Prop({
    type: [
      {
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ['string', 'number', 'boolean', 'array', 'object'],
          required: true,
        },
        defaultValue: MongooseSchema.Types.Mixed,
        description: String,
      },
    ],
    default: [],
  })
  variables: FlowVariable[];

  // Organization
  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ type: Number, default: 1 })
  version: number;

  // Template functionality
  @Prop({ type: Boolean, default: false, index: true })
  isTemplate: boolean;

  @Prop({ type: String })
  templateCategory?: string;

  // Analytics/Stats
  @Prop({
    type: {
      totalRuns: { type: Number, default: 0 },
      successfulRuns: { type: Number, default: 0 },
      failedRuns: { type: Number, default: 0 },
      averageCompletionTime: { type: Number, default: 0 }, // in seconds
      lastRunAt: Date,
    },
    default: {},
  })
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageCompletionTime: number;
    lastRunAt?: Date;
  };

  @Prop({ type: Date, default: Date.now })
  lastEditedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const FlowSchema = SchemaFactory.createForClass(Flow);

// Indexes for performance
FlowSchema.index({ userId: 1, status: 1 });
FlowSchema.index({ userId: 1, updatedAt: -1 });
FlowSchema.index({ name: 'text', description: 'text' });
FlowSchema.index({ isTemplate: 1, templateCategory: 1 });

// Only one active flow per user (optional - remove if you want multiple active flows)
FlowSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' },
    name: 'unique_active_flow_per_user',
  },
);

// Update lastEditedAt on save
FlowSchema.pre('save', function () {
  this.lastEditedAt = new Date();
});

// Virtual for versions (if implementing versioning)
FlowSchema.virtual('versions', {
  ref: 'FlowVersion',
  localField: '_id',
  foreignField: 'flowId',
});

export { FlowSchema };
