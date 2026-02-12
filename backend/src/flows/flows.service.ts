import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Model} from 'mongoose';
import { Flow, FlowDocument } from './schemas/flow.schema';
import { FlowVersion, FlowVersionDocument } from './schemas/flow-version.schema';
import {
  CreateFlowDto,
  UpdateFlowDto,
  DuplicateFlowDto,
  CreateVersionDto,
  ImportFlowDto,
  FlowQueryDto,
} from './dto/flow.dto';
import { FlowValidatorService } from './validators/flow-validator.service';

@Injectable()
export class FlowsService {
  constructor(
    @InjectModel(Flow.name) private flowModel: Model<FlowDocument>,
    @InjectModel(FlowVersion.name)
    private flowVersionModel: Model<FlowVersionDocument>,
    private flowValidatorService: FlowValidatorService,
  ) {}

  /**
   * Create a new flow
   */
  async create(userId: string, createFlowDto: CreateFlowDto): Promise<FlowDocument> {
    // Initialize with default nodes if not provided
    const nodes = createFlowDto.nodes || [];
    const edges = createFlowDto.edges || [];

    // Create flow
    const flow = new this.flowModel({
      ...createFlowDto,
      userId,
      nodes,
      edges,
      status: 'draft',
      version: 1,
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageCompletionTime: 0,
      },
    });

    const savedFlow = await flow.save();

    // Create initial version if nodes exist
    if (nodes.length > 0) {
      await this.createVersion(
        userId,
        savedFlow._id.toString(),
        {
          changeDescription: 'Initial version',
        },
        'auto',
      );
    }

    return savedFlow;
  }

  /**
   * Find all flows for a user with filtering and pagination
   */
  async findAll(userId: string, query: FlowQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      tags,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { userId };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [flows, total] = await Promise.all([
      this.flowModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-nodes -edges') // Exclude large fields for list view
        .lean(),
      this.flowModel.countDocuments(filter),
    ]);

    return {
      flows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find flow by ID
   */
  async findOne(userId: string, flowId: string): Promise<FlowDocument> {
    const flow = await this.flowModel.findById(flowId);

    if (!flow) {
      throw new NotFoundException(`Flow with ID ${flowId} not found`);
    }

    // Check ownership
    if (flow.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this flow');
    }

    return flow;
  }

  /**
   * Update flow
   */
  async update(
    userId: string,
    flowId: string,
    updateFlowDto: UpdateFlowDto,
  ): Promise<FlowDocument> {
    const flow = await this.findOne(userId, flowId);

    // Update fields
    Object.assign(flow, updateFlowDto);

    // Validate if nodes or edges were updated
    if (updateFlowDto.nodes || updateFlowDto.edges) {
      const validation = this.flowValidatorService.validate(flow);

      if (!validation.isValid) {
        throw new BadRequestException({
          message: 'Flow validation failed',
          errors: validation.errors,
          warnings: validation.warnings,
        });
      }
    }

    // Save
    const updatedFlow = await flow.save();

    return updatedFlow;
  }

  /**
   * Delete flow
   */
  async remove(userId: string, flowId: string): Promise<void> {
    const flow:FlowDocument = await this.findOne(userId, flowId);

    // Delete all versions
    await this.flowVersionModel.deleteMany({ flowId: flow.id });

    // Delete flow
    await this.flowModel.findByIdAndDelete(flowId);
  }

  /**
   * Duplicate flow
   */
  async duplicate(
    userId: string,
    flowId: string,
    duplicateFlowDto: DuplicateFlowDto,
  ): Promise<FlowDocument> {
    const originalFlow = await this.findOne(userId, flowId);

    // Create duplicate
    const duplicateFlow = new this.flowModel({
      userId,
      name: duplicateFlowDto.name,
      description: duplicateFlowDto.description || originalFlow.description,
      nodes: originalFlow.nodes,
      edges: originalFlow.edges,
      viewport: originalFlow.viewport,
      variables: originalFlow.variables,
      tags: originalFlow.tags,
      status: 'draft', // Always start as draft
      version: 1,
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageCompletionTime: 0,
      },
    });

    const savedFlow = await duplicateFlow.save();

    // Create initial version
    await this.createVersion(
      userId,
      savedFlow._id.toString(),
      { changeDescription: `Duplicated from ${originalFlow.name}` },
      'auto',
    );

    return savedFlow;
  }

  /**
   * Activate flow (only one active flow per user)
   */
  async activate(userId: string, flowId: string): Promise<FlowDocument> {
    const flow = await this.findOne(userId, flowId);

    // Validate flow before activation
    const validation = this.flowValidatorService.validateForActivation(flow);

    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Cannot activate flow with validation errors',
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }

    // Deactivate all other flows for this user
    await this.flowModel.updateMany(
      { userId, status: 'active' },
      { status: 'inactive' },
    );

    // Activate this flow
    flow.status = 'active';
    return await flow.save();
  }

  /**
   * Deactivate flow
   */
  async deactivate(userId: string, flowId: string): Promise<FlowDocument> {
    const flow = await this.findOne(userId, flowId);

    if (flow.status !== 'active') {
      throw new BadRequestException('Flow is not active');
    }

    flow.status = 'inactive';
    return await flow.save();
  }

  /**
   * Validate flow
   */
  async validate(userId: string, flowId: string) {
    const flow = await this.findOne(userId, flowId);
    return this.flowValidatorService.validate(flow);
  }

  /**
   * Create version snapshot
   */
  async createVersion(
    userId: string,
    flowId: string,
    createVersionDto: CreateVersionDto,
    changeType: 'manual' | 'auto' = 'manual',
  ): Promise<FlowVersionDocument> {
    const flow = await this.findOne(userId, flowId);

    // Get current version count
    const versionCount = await this.flowVersionModel.countDocuments({
      flowId: flow._id,
    });

    // Create version snapshot
    const version = new this.flowVersionModel({
      flowId: flow._id,
      versionNumber: versionCount + 1,
      snapshot: {
        name: flow.name,
        description: flow.description,
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport,
        variables: flow.variables,
        tags: flow.tags,
      },
      changeDescription: createVersionDto.changeDescription,
      changeType,
      createdBy: userId,
    });

    return await version.save();
  }

  /**
   * Get all versions for a flow
   */
  async getVersions(userId: string, flowId: string) {
    const flow = await this.findOne(userId, flowId);

    const versions = await this.flowVersionModel
      .find({ flowId: flow._id })
      .sort({ versionNumber: -1 })
      .select('-snapshot') // Exclude snapshot for list view
      .lean();

    return versions;
  }

  /**
   * Get specific version
   */
  async getVersion(
    userId: string,
    flowId: string,
    versionNumber: number,
  ): Promise<FlowVersionDocument> {
    const flow = await this.findOne(userId, flowId);

    const version = await this.flowVersionModel.findOne({
      flowId: flow._id,
      versionNumber,
    });

    if (!version) {
      throw new NotFoundException(
        `Version ${versionNumber} not found for this flow`,
      );
    }

    return version;
  }

  /**
   * Restore flow to a specific version
   */
  async restoreVersion(
    userId: string,
    flowId: string,
    versionNumber: number,
  ): Promise<FlowDocument> {
    const version = await this.getVersion(userId, flowId, versionNumber);
    const flow = await this.findOne(userId, flowId);

    // Create a version of current state before restoring
    await this.createVersion(
      userId,
      flowId,
      { changeDescription: `Before restoring to version ${versionNumber}` },
      'auto',
    );

    // Restore from snapshot
    flow.name = version.snapshot.name;
    flow.description = version.snapshot.description;
    flow.nodes = version.snapshot.nodes;
    flow.edges = version.snapshot.edges;
    flow.viewport = version.snapshot.viewport;
    flow.variables = version.snapshot.variables;
    flow.tags = version.snapshot.tags;

    const restoredFlow = await flow.save();

    // Create version after restore
    await this.createVersion(
      userId,
      flowId,
      { changeDescription: `Restored to version ${versionNumber}` },
      'auto',
    );

    return restoredFlow;
  }

  /**
   * Export flow as JSON
   */
  async export(userId: string, flowId: string) {
    const flow = await this.findOne(userId, flowId);

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      flow: {
        name: flow.name,
        description: flow.description,
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport,
        variables: flow.variables,
        tags: flow.tags,
      },
    };
  }

  /**
   * Import flow from JSON
   */
  async import(userId: string, importFlowDto: ImportFlowDto): Promise<FlowDocument> {
    const { flowData, name } = importFlowDto;

    // Validate imported data structure
    if (!flowData.flow) {
      throw new BadRequestException('Invalid flow data format');
    }

    const { flow: importedFlow } = flowData;

    // Create new flow from imported data
    const flow = new this.flowModel({
      userId,
      name: name || importedFlow.name || 'Imported Flow',
      description: importedFlow.description,
      nodes: importedFlow.nodes || [],
      edges: importedFlow.edges || [],
      viewport: importedFlow.viewport || { x: 0, y: 0, zoom: 1 },
      variables: importedFlow.variables || [],
      tags: importedFlow.tags || [],
      status: 'draft',
      version: 1,
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageCompletionTime: 0,
      },
    });

    // Validate before saving
    const validation = this.flowValidatorService.validate(flow);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Imported flow has validation errors',
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }

    const savedFlow = await flow.save();

    // Create initial version
    await this.createVersion(
      userId,
      savedFlow._id.toString(),
      { changeDescription: 'Imported from JSON' },
      'auto',
    );

    return savedFlow;
  }

  /**
   * Get flow statistics for a user
   */
  async getStats(userId: string) {
    const [totalFlows, draftFlows, activeFlows, inactiveFlows] = await Promise.all([
      this.flowModel.countDocuments({ userId }),
      this.flowModel.countDocuments({ userId, status: 'draft' }),
      this.flowModel.countDocuments({ userId, status: 'active' }),
      this.flowModel.countDocuments({ userId, status: 'inactive' }),
    ]);

    // Get most used tags
    const tagAggregation = await this.flowModel.aggregate([
      { $match: { userId } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get recent flows
    const recentFlows = await this.flowModel
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name status updatedAt')
      .lean();

    return {
      totalFlows,
      draftFlows,
      activeFlows,
      inactiveFlows,
      popularTags: tagAggregation.map((t) => ({ tag: t._id, count: t.count })),
      recentFlows,
    };
  }

  /**
   * Get templates (public flows marked as templates)
   */
  async getTemplates(query: FlowQueryDto) {
    const { page = 1, limit = 10, search, tags } = query;
    const skip = (page - 1) * limit;

    const filter: any = { isTemplate: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim());
      filter.tags = { $in: tagArray };
    }

    const [templates, total] = await Promise.all([
      this.flowModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-nodes -edges -userId')
        .lean(),
      this.flowModel.countDocuments(filter),
    ]);

    return {
      templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update flow stats after execution
   */
  async updateStats(
    flowId: string,
    success: boolean,
    completionTime: number,
  ): Promise<void> {
    const flow = await this.flowModel.findById(flowId);
    if (!flow) return;

    flow.stats.totalRuns += 1;
    if (success) {
      flow.stats.successfulRuns += 1;
    } else {
      flow.stats.failedRuns += 1;
    }

    // Update average completion time
    const totalTime =
      flow.stats.averageCompletionTime * (flow.stats.totalRuns - 1) + completionTime;
    flow.stats.averageCompletionTime = totalTime / flow.stats.totalRuns;
    flow.stats.lastRunAt = new Date();

    await flow.save();
  }
}
