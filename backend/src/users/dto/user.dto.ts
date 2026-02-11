import {ApiProperty} from "@nestjs/swagger";
import {ThemeEnum} from "../enums/theme.enum";

export class UserDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    role: string;

    @ApiProperty({ required: false })
    avatar?: string;

    @ApiProperty()
    settings: {
        theme: ThemeEnum.Light | ThemeEnum.Dark;
        autoSave: boolean;
        autoSaveInterval: number;
    };

    @ApiProperty()
    emailVerified: boolean;

    @ApiProperty({ required: false })
    lastLoginAt?: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}