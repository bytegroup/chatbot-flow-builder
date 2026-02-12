import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FlowsService } from '../flows.service';
import { FlowValidatorService } from '../validators/flow-validator.service';
import { Flow } from '../schemas/flow.schema';
import { FlowVersion } from '../schemas/flow-version.schema';

describe('FlowsService', () => {
  let service: FlowsService;
  let flowModel: any;
  let flowVersionModel: any;
  let validatorService: FlowValidatorService;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockFlowId = '507f1f77bcf86cd799439012';

  const mockFlow = {
    _id: mockFlowId,
    userId: mockUserId,
    name: 'Test Flow',
    description: 'Test Description',
    status: 'draft',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'Start' },
      },
    ],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    variables: [],
    tags: ['test'],
    version: 1,
    stats: {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      averageCompletionTime: 0,
    },
    save: jest.fn().mockResolvedValue(this),
    toObject: jest.fn().mockReturnThis(),
  };

  const mockFlowModel = {
    new: jest.fn().mockResolvedValue(mockFlow),
    constructor: jest.fn().mockResolvedValue(mockFlow),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    updateMany: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockFlowVersionModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockValidatorService = {
    validate: jest.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [],
    }),
    validateForActivation: jest.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlowsService,
        {
          provide: getModelToken(Flow.name),
          useValue: mockFlowModel,
        },
        {
          provide: getModelToken(FlowVersion.name),
          useValue: mockFlowVersionModel,
        },
        {
          provide: FlowValidatorService,
          useValue: mockValidatorService,
        },
      ],
    }).compile();

    service = module.get<FlowsService>(FlowsService);
    flowModel = module.get(getModelToken(Flow.name));
    flowVersionModel = module.get(getModelToken(FlowVersion.name));
    validatorService = module.get<FlowValidatorService>(FlowValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new flow', async () => {
      const createFlowDto = {
        name: 'New Flow',
        description: 'New Description',
        nodes: [],
        edges: [],
      };

      mockFlow.save = jest.fn().mockResolvedValue(mockFlow);
      mockFlowModel.constructor.mockImplementation(() => ({
        ...mockFlow,
        save: jest.fn().mockResolvedValue(mockFlow),
      }));

      mockFlowVersionModel.countDocuments.mockResolvedValue(0);

      const result = await service.create(mockUserId, createFlowDto);

      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should find a flow by ID', async () => {
      mockFlowModel.findById.mockResolvedValue(mockFlow);

      const result = await service.findOne(mockUserId, mockFlowId);

      expect(result).toEqual(mockFlow);
      expect(mockFlowModel.findById).toHaveBeenCalledWith(mockFlowId);
    });

    it('should throw NotFoundException if flow not found', async () => {
      mockFlowModel.findById.mockResolvedValue(null);

      await expect(service.findOne(mockUserId, mockFlowId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own flow', async () => {
      const differentUserId = '507f1f77bcf86cd799439999';
      mockFlowModel.findById.mockResolvedValue(mockFlow);

      await expect(service.findOne(differentUserId, mockFlowId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a flow', async () => {
      const updateFlowDto = {
        name: 'Updated Flow',
        description: 'Updated Description',
      };

      mockFlowModel.findById.mockResolvedValue({
        ...mockFlow,
        save: jest.fn().mockResolvedValue({ ...mockFlow, ...updateFlowDto }),
      });

      const result = await service.update(mockUserId, mockFlowId, updateFlowDto);

      expect(result).toBeDefined();
    });

    it('should validate flow when nodes or edges are updated', async () => {
      const updateFlowDto = {
        nodes: [{ id: 'new-node', type: 'message', position: { x: 0, y: 0 }, data: {} }],
      };

      mockFlowModel.findById.mockResolvedValue({
        ...mockFlow,
        save: jest.fn().mockResolvedValue(mockFlow),
      });

      await service.update(mockUserId, mockFlowId, updateFlowDto);

      expect(validatorService.validate).toHaveBeenCalled();
    });

    it('should throw BadRequestException if validation fails', async () => {
      const updateFlowDto = {
        nodes: [],
      };

      mockFlowModel.findById.mockResolvedValue({
        ...mockFlow,
        save: jest.fn().mockResolvedValue(mockFlow),
      });

      mockValidatorService.validate.mockReturnValue({
        isValid: false,
        errors: [{ code: 'NO_START_NODE', message: 'Flow must have a start node' }],
        warnings: [],
      });

      await expect(
        service.update(mockUserId, mockFlowId, updateFlowDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('activate', () => {
    it('should activate a flow', async () => {
      mockFlowModel.findById.mockResolvedValue({
        ...mockFlow,
        save: jest.fn().mockResolvedValue({ ...mockFlow, status: 'active' }),
      });
      mockFlowModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.activate(mockUserId, mockFlowId);

      expect(result.status).toBe('active');
      expect(mockFlowModel.updateMany).toHaveBeenCalled();
    });

    it('should validate flow before activation', async () => {
      mockFlowModel.findById.mockResolvedValue({
        ...mockFlow,
        save: jest.fn().mockResolvedValue(mockFlow),
      });
      mockFlowModel.updateMany.mockResolvedValue({ modifiedCount: 0 });

      mockValidatorService.validateForActivation.mockReturnValue({
        isValid: false,
        errors: [{ code: 'NO_END_NODE', message: 'Flow must have an end node' }],
        warnings: [],
      });

      await expect(service.activate(mockUserId, mockFlowId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('duplicate', () => {
    it('should duplicate a flow', async () => {
      const duplicateDto = {
        name: 'Copy of Test Flow',
        description: 'Duplicated',
      };

      mockFlowModel.findById.mockResolvedValue(mockFlow);
      mockFlowModel.constructor.mockImplementation(() => ({
        ...mockFlow,
        name: duplicateDto.name,
        save: jest.fn().mockResolvedValue(mockFlow),
      }));
      mockFlowVersionModel.countDocuments.mockResolvedValue(0);

      const result = await service.duplicate(mockUserId, mockFlowId, duplicateDto);

      expect(result).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should validate a flow', async () => {
      mockFlowModel.findById.mockResolvedValue(mockFlow);

      const result = await service.validate(mockUserId, mockFlowId);

      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(validatorService.validate).toHaveBeenCalled();
    });
  });

  describe('export', () => {
    it('should export flow as JSON', async () => {
      mockFlowModel.findById.mockResolvedValue(mockFlow);

      const result = await service.export(mockUserId, mockFlowId);

      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('exportedAt');
      expect(result).toHaveProperty('flow');
      expect(result.flow).toHaveProperty('name');
      expect(result.flow).toHaveProperty('nodes');
    });
  });

  describe('getStats', () => {
    it('should return flow statistics', async () => {
      mockFlowModel.countDocuments.mockResolvedValue(10);
      mockFlowModel.aggregate.mockResolvedValue([
        { _id: 'test', count: 5 },
        { _id: 'demo', count: 3 },
      ]);
      mockFlowModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getStats(mockUserId);

      expect(result).toHaveProperty('totalFlows');
      expect(result).toHaveProperty('popularTags');
      expect(result).toHaveProperty('recentFlows');
    });
  });
});
