import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/schemas/user.schema';
import { RefreshToken } from '../schemas/refresh-token.schema';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
  let refreshTokenModel: any;
  let jwtService: JwtService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: 'user',
    emailVerified: false,
    settings: {
      theme: 'light',
      autoSave: true,
      autoSaveInterval: 30,
    },
    comparePassword: jest.fn(),
    save: jest.fn(),
    toJSON: jest.fn(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    new: jest.fn().mockResolvedValue(mockUser),
    constructor: jest.fn().mockResolvedValue(mockUser),
  };

  const mockRefreshTokenModel = {
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteMany: jest.fn(),
    new: jest.fn(),
    constructor: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: mockRefreshTokenModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    refreshTokenModel = module.get(getModelToken(RefreshToken.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUser.save.mockResolvedValue(mockUser);
      mockUser.toJSON.mockReturnValue({ ...mockUser, password: undefined });

      const mockRefreshToken = {
        save: jest.fn().mockResolvedValue({}),
      };
      mockRefreshTokenModel.constructor.mockImplementation(() => mockRefreshToken);

      // Mock the model constructor to return an instance with save method
      const mockUserInstance = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(mockUser),
      };
      mockUserModel.constructor = jest.fn(() => mockUserInstance);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Existing User',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(mockUser);
    });

    it('should return null with incorrect password', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong');

      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );

      expect(result).toBeNull();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const mockRefreshToken = {
        save: jest.fn().mockResolvedValue({}),
      };
      mockRefreshTokenModel.constructor.mockImplementation(() => mockRefreshToken);

      const result = await service.generateTokens(mockUser as any);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });
});
