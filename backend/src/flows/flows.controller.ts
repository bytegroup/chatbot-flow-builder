import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FlowsService } from './flows.service';
import {
  CreateFlowDto,
  UpdateFlowDto,
  DuplicateFlowDto,
  CreateVersionDto,
  ImportFlowDto,
  FlowQueryDto,
} from './dto/flow.dto';
import { GetUserId } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Flows')
@ApiBearerAuth()
@Controller('flows')
export class FlowsController {
  constructor(private readonly flowsService: FlowsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new flow' })
  @ApiResponse({ status: 201, description: 'Flow created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@GetUserId() userId: string, @Body() createFlowDto: CreateFlowDto) {
    return this.flowsService.create(userId, createFlowDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all flows for current user' })
  @ApiResponse({ status: 200, description: 'Flows retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'active', 'inactive'] })
  @ApiQuery({ name: 'tags', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(@GetUserId() userId: string, @Query() query: FlowQueryDto) {
    return this.flowsService.findAll(userId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get flow statistics for current user' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@GetUserId() userId: string) {
    return this.flowsService.getStats(userId);
  }

  @Public()
  @Get('templates')
  @ApiOperation({ summary: 'Get flow templates (public)' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: String })
  async getTemplates(@Query() query: FlowQueryDto) {
    return this.flowsService.getTemplates(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flow by ID' })
  async findOne(@GetUserId() userId: string, @Param('id') id: string) {
    return this.flowsService.findOne(userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update flow' })
  async update(
    @GetUserId() userId: string,
    @Param('id') id: string,
    @Body() updateFlowDto: UpdateFlowDto,
  ) {
    return this.flowsService.update(userId, id, updateFlowDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete flow' })
  async remove(@GetUserId() userId: string, @Param('id') id: string) {
    await this.flowsService.remove(userId, id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate flow' })
  async duplicate(
    @GetUserId() userId: string,
    @Param('id') id: string,
    @Body() duplicateFlowDto: DuplicateFlowDto,
  ) {
    return this.flowsService.duplicate(userId, id, duplicateFlowDto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate flow' })
  async activate(@GetUserId() userId: string, @Param('id') id: string) {
    return this.flowsService.activate(userId, id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate flow' })
  async deactivate(@GetUserId() userId: string, @Param('id') id: string) {
    return this.flowsService.deactivate(userId, id);
  }

  @Get(':id/validate')
  @ApiOperation({ summary: 'Validate flow structure' })
  async validate(@GetUserId() userId: string, @Param('id') id: string) {
    return this.flowsService.validate(userId, id);
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export flow as JSON' })
  async export(@GetUserId() userId: string, @Param('id') id: string) {
    return this.flowsService.export(userId, id);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import flow from JSON' })
  async import(@GetUserId() userId: string, @Body() importFlowDto: ImportFlowDto) {
    return this.flowsService.import(userId, importFlowDto);
  }

  // Version Management Endpoints

  @Post(':id/versions')
  @ApiOperation({ summary: 'Create version snapshot' })
  async createVersion(
    @GetUserId() userId: string,
    @Param('id') id: string,
    @Body() createVersionDto: CreateVersionDto,
  ) {
    return this.flowsService.createVersion(userId, id, createVersionDto);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get all versions of a flow' })
  async getVersions(@GetUserId() userId: string, @Param('id') id: string) {
    return this.flowsService.getVersions(userId, id);
  }

  @Get(':id/versions/:versionNumber')
  @ApiOperation({ summary: 'Get specific version' })
  async getVersion(
    @GetUserId() userId: string,
    @Param('id') id: string,
    @Param('versionNumber') versionNumber: number,
  ) {
    return this.flowsService.getVersion(userId, id, +versionNumber);
  }

  @Post(':id/versions/:versionNumber/restore')
  @ApiOperation({ summary: 'Restore flow to specific version' })
  async restoreVersion(
    @GetUserId() userId: string,
    @Param('id') id: string,
    @Param('versionNumber') versionNumber: number,
  ) {
    return this.flowsService.restoreVersion(userId, id, +versionNumber);
  }
}
