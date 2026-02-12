// src/lib/types/flow.ts

export type NodeType = 
  | 'start' 
  | 'end' 
  | 'message' 
  | 'input' 
  | 'condition' 
  | 'api' 
  | 'delay' 
  | 'jump';

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeData {
  label?: string;
  
  // Message node
  message?: string;
  richContent?: {
    type: 'text' | 'image' | 'link' | 'card';
    content: any;
  };
  
  // Input node
  inputType?: 'text' | 'number' | 'email' | 'choice';
  placeholder?: string;
  variableName?: string;
  validation?: {
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
  };
  choices?: string[];
  
  // Condition node
  conditions?: Array<{
    id: string;
    variable: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith';
    value: any;
    targetNodeId: string;
    label?: string;
  }>;
  defaultTarget?: string;
  
  // API node
  apiConfig?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    responseVariable?: string;
    timeout?: number;
  };
  
  // Delay node
  delay?: number;
  displayMessage?: string;
  
  // Jump node
  targetNodeId?: string;
  
  // Common
  description?: string;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  position: NodePosition;
  data: NodeData;
  style?: Record<string, any>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  type?: 'default' | 'step' | 'smoothstep' | 'straight';
  animated?: boolean;
  style?: Record<string, any>;
}

export interface FlowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: any;
  description?: string;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Flow {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'inactive';
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: Viewport;
  variables: FlowVariable[];
  tags: string[];
  version: number;
  isTemplate: boolean;
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageCompletionTime: number;
    lastRunAt?: string;
  };
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlowDto {
  name: string;
  description?: string;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  viewport?: Viewport;
  variables?: FlowVariable[];
  tags?: string[];
}

export interface UpdateFlowDto {
  name?: string;
  description?: string;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  viewport?: Viewport;
  variables?: FlowVariable[];
  tags?: string[];
  status?: 'draft' | 'active' | 'inactive';
}

export interface ValidationError {
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface FlowVersion {
  _id: string;
  flowId: string;
  versionNumber: number;
  snapshot: {
    name: string;
    description?: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    viewport: Viewport;
    variables: FlowVariable[];
    tags: string[];
  };
  changeDescription?: string;
  changeType: 'manual' | 'auto';
  createdBy: string;
  fileSize?: number;
  createdAt: string;
}

export interface FlowsResponse {
  flows: Flow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FlowStats {
  totalFlows: number;
  draftFlows: number;
  activeFlows: number;
  inactiveFlows: number;
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
  recentFlows: Array<{
    _id: string;
    name: string;
    status: string;
    updatedAt: string;
  }>;
}
