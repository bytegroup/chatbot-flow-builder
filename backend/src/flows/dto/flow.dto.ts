import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  MaxLength,
  ValidateNested,
  IsNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Node DTO
class NodePositionDto {
  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;
}

class NodeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ enum: ['start', 'end', 'message', 'input', 'condition', 'api', 'delay', 'jump'] })
  @IsEnum(['start', 'end', 'message', 'input', 'condition', 'api', 'delay', 'jump'])
  type: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => NodePositionDto)
  position: NodePositionDto;

  @ApiProperty()
  @IsObject()
  data: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  style?: any;
}

// Edge DTO
class EdgeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  target: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceHandle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetHandle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  animated?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  style?: any;
}

// Viewport DTO
class ViewportDto {
  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;

  @ApiProperty()
  @IsNumber()
  zoom: number;
}

// Variable DTO
class FlowVariableDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ['string', 'number', 'boolean', 'array', 'object'] })
  @IsEnum(['string', 'number', 'boolean', 'array', 'object'])
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  defaultValue?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

// Create Flow DTO
export class CreateFlowDto {
  @ApiProperty({ example: 'Welcome Flow', description: 'Flow name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'A simple welcome flow for new users',
    description: 'Flow description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: [],
    description: 'Array of nodes',
    type: [NodeDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  nodes?: NodeDto[];

  @ApiPropertyOptional({
    example: [],
    description: 'Array of edges',
    type: [EdgeDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EdgeDto)
  edges?: EdgeDto[];

  @ApiPropertyOptional({
    example: { x: 0, y: 0, zoom: 1 },
    description: 'Canvas viewport state',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ViewportDto)
  viewport?: ViewportDto;

  @ApiPropertyOptional({
    example: [],
    description: 'Flow variables',
    type: [FlowVariableDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowVariableDto)
  variables?: FlowVariableDto[];

  @ApiPropertyOptional({
    example: ['welcome', 'onboarding'],
    description: 'Flow tags',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

// Update Flow DTO (all fields optional)
export class UpdateFlowDto {
  @ApiPropertyOptional({ example: 'Updated Flow Name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ type: [NodeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  nodes?: NodeDto[];

  @ApiPropertyOptional({ type: [EdgeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EdgeDto)
  edges?: EdgeDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ViewportDto)
  viewport?: ViewportDto;

  @ApiPropertyOptional({ type: [FlowVariableDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowVariableDto)
  variables?: FlowVariableDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: ['draft', 'active', 'inactive'] })
  @IsOptional()
  @IsEnum(['draft', 'active', 'inactive'])
  status?: 'draft' | 'active' | 'inactive';
}

// Duplicate Flow DTO
export class DuplicateFlowDto {
  @ApiProperty({ example: 'Copy of Welcome Flow' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Duplicated flow' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

// Create Version DTO
export class CreateVersionDto {
  @ApiPropertyOptional({
    example: 'Added new message node',
    description: 'Description of changes',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  changeDescription?: string;
}

// Import Flow DTO
export class ImportFlowDto {
  @ApiProperty({ description: 'Flow JSON data' })
  @IsObject()
  @IsNotEmpty()
  flowData: any;

  @ApiPropertyOptional({ example: 'Imported Flow' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}

// Query DTOs
export class FlowQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'welcome' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'inactive'] })
  @IsOptional()
  @IsEnum(['draft', 'active', 'inactive'])
  status?: 'draft' | 'active' | 'inactive';

  @ApiPropertyOptional({ example: 'welcome,onboarding' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ enum: ['name', 'createdAt', 'updatedAt'], default: 'updatedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'updatedAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export { NodeDto, EdgeDto, ViewportDto, FlowVariableDto };
