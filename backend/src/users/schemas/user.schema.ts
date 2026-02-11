import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document, HydratedDocument} from 'mongoose';
import * as bcrypt from "bcrypt";
import {Role} from "../enums/roles.enum";
import {ThemeEnum} from "../enums/theme.enum";

export interface UserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export type UserDocument = HydratedDocument<User, UserMethods>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true, minlength: 8 })
    password: string;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ type: String, enum: Role, default: Role.User })
    role: string;

    @Prop({ type: String })
    avatar?: string;

    @Prop({
        type: {
            theme: { type: String, enum: ThemeEnum, default: ThemeEnum.Light },
            autoSave: { type: Boolean, default: true },
            autoSaveInterval: { type: Number, default: 30 },
        },
        default: {},
    })
    settings: {
        theme: ThemeEnum.Light | ThemeEnum.Dark;
        autoSave: boolean;
        autoSaveInterval: number;
    };

    @Prop({ type: Date })
    lastLoginAt?: Date;

    @Prop({ type: Boolean, default: false })
    emailVerified: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function () {

    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (
    candidatePassword: string,
): Promise<boolean> {
    const user = this as UserDocument;
    return bcrypt.compare(candidatePassword, user.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

// Indexes
UserSchema.index({ createdAt: -1 });

export { UserSchema };