import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema, Types} from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({timestamps: {createdAt: true, updatedAt: false}})
export class RefreshToken {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop({
    type: {
      userAgent: String,
      ipAddress: String,
    },
  })
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
  };

  createdAt: Date;
}

const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

export { RefreshTokenSchema };
