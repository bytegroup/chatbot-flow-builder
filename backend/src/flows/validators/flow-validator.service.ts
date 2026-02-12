import { Injectable } from '@nestjs/common';
import { Flow } from '../schemas/flow.schema';

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

@Injectable()
export class FlowValidatorService {
  /**
   * Validate complete flow structure
   */
  validate(flow: Partial<Flow>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!flow.nodes || flow.nodes.length === 0) {
      return {
        isValid: true,
        errors: [],
        warnings: [
          {
            code: 'EMPTY_FLOW',
            message: 'Flow has no nodes',
          },
        ],
      };
    }

    // Validate nodes
    this.validateNodes(flow.nodes, errors, warnings);

    // Validate edges
    if (flow.edges && flow.edges.length > 0) {
      this.validateEdges(flow.nodes, flow.edges, errors, warnings);
    }

    // Validate flow structure
    this.validateFlowStructure(flow.nodes, flow.edges || [], errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate individual nodes
   */
  private validateNodes(
    nodes: any[],
    errors: ValidationError[],
    warnings: ValidationError[],
  ): void {
    const nodeIds = new Set<string>();
    let startNodeCount = 0;
    let endNodeCount = 0;

    for (const node of nodes) {
      // Check for duplicate node IDs
      if (nodeIds.has(node.id)) {
        errors.push({
          code: 'DUPLICATE_NODE_ID',
          message: `Duplicate node ID: ${node.id}`,
          nodeId: node.id,
        });
      }
      nodeIds.add(node.id);

      // Count special nodes
      if (node.type === 'start') startNodeCount++;
      if (node.type === 'end') endNodeCount++;

      // Validate node-specific data
      this.validateNodeData(node, errors, warnings);
    }

    // Flow must have exactly one start node
    if (startNodeCount === 0) {
      errors.push({
        code: 'NO_START_NODE',
        message: 'Flow must have a start node',
      });
    } else if (startNodeCount > 1) {
      errors.push({
        code: 'MULTIPLE_START_NODES',
        message: 'Flow can only have one start node',
      });
    }

    // Flow must have at least one end node
    if (endNodeCount === 0) {
      warnings.push({
        code: 'NO_END_NODE',
        message: 'Flow should have at least one end node',
      });
    }
  }

  /**
   * Validate node-specific data
   */
  private validateNodeData(
    node: any,
    errors: ValidationError[],
    warnings: ValidationError[],
  ): void {
    const { type, data } = node;

    switch (type) {
      case 'message':
        if (!data.message && !data.richContent) {
          errors.push({
            code: 'EMPTY_MESSAGE',
            message: 'Message node must have content',
            nodeId: node.id,
          });
        }
        break;

      case 'input':
        if (!data.variableName) {
          warnings.push({
            code: 'NO_VARIABLE_NAME',
            message: 'Input node should store result in a variable',
            nodeId: node.id,
          });
        }
        if (!data.inputType) {
          errors.push({
            code: 'NO_INPUT_TYPE',
            message: 'Input node must specify input type',
            nodeId: node.id,
          });
        }
        break;

      case 'condition':
        if (!data.conditions || data.conditions.length === 0) {
          errors.push({
            code: 'NO_CONDITIONS',
            message: 'Condition node must have at least one condition',
            nodeId: node.id,
          });
        } else {
          // Validate each condition
          for (const condition of data.conditions) {
            if (!condition.variable) {
              errors.push({
                code: 'CONDITION_NO_VARIABLE',
                message: 'Condition must specify a variable',
                nodeId: node.id,
              });
            }
            if (!condition.operator) {
              errors.push({
                code: 'CONDITION_NO_OPERATOR',
                message: 'Condition must specify an operator',
                nodeId: node.id,
              });
            }
          }
        }
        break;

      case 'api':
        if (!data.apiConfig?.url) {
          errors.push({
            code: 'API_NO_URL',
            message: 'API node must have a URL',
            nodeId: node.id,
          });
        }
        if (!data.apiConfig?.method) {
          errors.push({
            code: 'API_NO_METHOD',
            message: 'API node must have a method',
            nodeId: node.id,
          });
        }
        break;

      case 'delay':
        if (data.delay === undefined || data.delay === null) {
          errors.push({
            code: 'DELAY_NO_DURATION',
            message: 'Delay node must have a duration',
            nodeId: node.id,
          });
        } else if (data.delay < 0) {
          errors.push({
            code: 'DELAY_NEGATIVE',
            message: 'Delay duration cannot be negative',
            nodeId: node.id,
          });
        } else if (data.delay > 300000) {
          // 5 minutes
          warnings.push({
            code: 'DELAY_TOO_LONG',
            message: 'Delay is longer than 5 minutes',
            nodeId: node.id,
          });
        }
        break;

      case 'jump':
        if (!data.targetNodeId) {
          errors.push({
            code: 'JUMP_NO_TARGET',
            message: 'Jump node must have a target node',
            nodeId: node.id,
          });
        }
        break;
    }
  }

  /**
   * Validate edges
   */
  private validateEdges(
    nodes: any[],
    edges: any[],
    errors: ValidationError[],
    warnings: ValidationError[],
  ): void {
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edgeIds = new Set<string>();

    for (const edge of edges) {
      // Check for duplicate edge IDs
      if (edgeIds.has(edge.id)) {
        errors.push({
          code: 'DUPLICATE_EDGE_ID',
          message: `Duplicate edge ID: ${edge.id}`,
          edgeId: edge.id,
        });
      }
      edgeIds.add(edge.id);

      // Validate source node exists
      if (!nodeIds.has(edge.source)) {
        errors.push({
          code: 'INVALID_EDGE_SOURCE',
          message: `Edge references non-existent source node: ${edge.source}`,
          edgeId: edge.id,
        });
      }

      // Validate target node exists
      if (!nodeIds.has(edge.target)) {
        errors.push({
          code: 'INVALID_EDGE_TARGET',
          message: `Edge references non-existent target node: ${edge.target}`,
          edgeId: edge.id,
        });
      }

      // Check for self-loops
      if (edge.source === edge.target) {
        warnings.push({
          code: 'SELF_LOOP',
          message: 'Node connects to itself',
          edgeId: edge.id,
        });
      }
    }
  }

  /**
   * Validate overall flow structure
   */
  private validateFlowStructure(
    nodes: any[],
    edges: any[],
    errors: ValidationError[],
    warnings: ValidationError[],
  ): void {
    // Build adjacency list
    const adjacency = new Map<string, string[]>();
    const incomingEdges = new Map<string, number>();

    nodes.forEach((node) => {
      adjacency.set(node.id, []);
      incomingEdges.set(node.id, 0);
    });

    edges.forEach((edge) => {
      if (adjacency.has(edge.source)) {
        adjacency.get(edge.source)!.push(edge.target);
      }
      if (incomingEdges.has(edge.target)) {
        incomingEdges.set(edge.target, incomingEdges.get(edge.target)! + 1);
      }
    });

    // Find start node
    const startNode = nodes.find((n) => n.type === 'start');
    if (!startNode) {
      return; // Already reported in validateNodes
    }

    // Check for orphaned nodes (except start)
    const reachable = new Set<string>();
    const visited = new Set<string>();

    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      reachable.add(nodeId);

      const neighbors = adjacency.get(nodeId) || [];
      neighbors.forEach((neighbor) => dfs(neighbor));
    };

    dfs(startNode.id);

    // Check if all nodes are reachable from start
    nodes.forEach((node) => {
      if (node.type !== 'start' && !reachable.has(node.id)) {
        warnings.push({
          code: 'UNREACHABLE_NODE',
          message: `Node is not reachable from start node`,
          nodeId: node.id,
        });
      }
    });

    // Check for nodes with no outgoing connections (except end nodes)
    nodes.forEach((node) => {
      if (node.type !== 'end') {
        const outgoing = adjacency.get(node.id) || [];
        if (outgoing.length === 0) {
          warnings.push({
            code: 'NO_OUTGOING_EDGES',
            message: 'Non-end node has no outgoing connections',
            nodeId: node.id,
          });
        }
      }
    });

    // Check for potential infinite loops (basic check)
    this.detectCycles(adjacency, warnings);
  }

  /**
   * Detect cycles in the flow (potential infinite loops)
   */
  private detectCycles(
    adjacency: Map<string, string[]>,
    warnings: ValidationError[],
  ): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycleDetected = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        recursionStack.add(nodeId);

        const neighbors = adjacency.get(nodeId) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor) && hasCycle(neighbor)) {
            cycleDetected.add(neighbor);
            return true;
          } else if (recursionStack.has(neighbor)) {
            cycleDetected.add(neighbor);
            return true;
          }
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    adjacency.forEach((_, nodeId) => {
      if (!visited.has(nodeId)) {
        hasCycle(nodeId);
      }
    });

    if (cycleDetected.size > 0) {
      warnings.push({
        code: 'POTENTIAL_INFINITE_LOOP',
        message: `Flow contains cycles which may cause infinite loops`,
      });
    }
  }

  /**
   * Quick validation for activation (only critical errors)
   */
  validateForActivation(flow: Partial<Flow>): ValidationResult {
    const result = this.validate(flow);

    // Filter only critical errors that prevent activation
    const criticalErrors = result.errors.filter((error) =>
      [
        'NO_START_NODE',
        'MULTIPLE_START_NODES',
        'EMPTY_MESSAGE',
        'NO_INPUT_TYPE',
        'NO_CONDITIONS',
        'API_NO_URL',
        'DELAY_NO_DURATION',
        'JUMP_NO_TARGET',
        'INVALID_EDGE_SOURCE',
        'INVALID_EDGE_TARGET',
      ].includes(error.code),
    );

    return {
      isValid: criticalErrors.length === 0,
      errors: criticalErrors,
      warnings: result.warnings,
    };
  }
}
