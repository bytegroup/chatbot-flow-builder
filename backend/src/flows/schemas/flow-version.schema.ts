import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema, Types} from 'mongoose';

export type FlowVersionDocument = HydratedDocument<FlowVersion>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class FlowVersion {
  @Prop({
    type: Types.ObjectId,
    ref: 'Flow',
    required: true,
    index: true,
  })
  flowId: Types.ObjectId;

  @Prop({ required: true })
  versionNumber: number;

  // Complete snapshot of the flow at this version
  @Prop({
    type: {
      name: String,
      description: String,
      nodes: [MongooseSchema.Types.Mixed],
      edges: [MongooseSchema.Types.Mixed],
      viewport: MongooseSchema.Types.Mixed,
      variables: [MongooseSchema.Types.Mixed],
      tags: [String],
    },
    required: true,
  })
  snapshot: {
    name: string;
    description?: string;
    nodes: any[];
    edges: any[];
    viewport: any;
    variables: any[];
    tags: string[];
  };

  @Prop({ type: String, maxlength: 500 })
  changeDescription?: string;

  @Prop({
    type: String,
    enum: ['manual', 'auto'],
    default: 'manual',
  })
  changeType: 'manual' | 'auto';

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  createdBy: Types.ObjectId;

  @Prop({ type: Number })
  fileSize?: number; // Size in bytes for reference

  createdAt: Date;
}

const FlowVersionSchema = SchemaFactory.createForClass(FlowVersion);

// Compound indexes
FlowVersionSchema.index({ flowId: 1, versionNumber: -1 });
FlowVersionSchema.index({ flowId: 1, createdAt: -1 });

// Unique constraint on flowId + versionNumber
FlowVersionSchema.index({ flowId: 1, versionNumber: 1 }, { unique: true });

// Calculate file size before save
FlowVersionSchema.pre('save', function () {
  if (this.snapshot) {
    this.fileSize = JSON.stringify(this.snapshot).length;
  }
});

export { FlowVersionSchema };
