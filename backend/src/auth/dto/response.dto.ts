import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
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
    theme: 'light' | 'dark';
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

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;
}
