import {forwardRef, Inject, Injectable, Logger} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flow, FlowDocument } from '../../flows/schemas/flow.schema';
import { ChatSession, ChatSessionDocument } from '../schemas/chat-session.schema';
import { v4 as uuidv4 } from 'uuid';
import {FlowsService} from "../../flows/flows.service";

interface ExecutionContext {
  sessionId: string;
  flowId: string;
  currentNodeId: string;
  variables: Map<string, any>;
  messages: any[];
  status: string;
  waitingForInput?: boolean;
  inputNodeId?: string;
}

@Injectable()
export class FlowExecutorService {
  private readonly logger = new Logger(FlowExecutorService.name);
  private activeSessions = new Map<string, ExecutionContext>();

  constructor(
    @InjectModel(Flow.name) private flowModel: Model<FlowDocument>,
    @InjectModel(ChatSession.name)
    private chatSessionModel: Model<ChatSessionDocument>,
    @Inject(forwardRef(() => FlowsService))
    private readonly flowsService: FlowsService,
  ) {}

  /**
   * Start a new chat session with a flow
   */
  async startSession(flowId: string, userId?: string, metadata?: any): Promise<ExecutionContext> {
    this.logger.log(`Starting new session for flow: ${flowId}`);

    // Get flow
    const flow = await this.flowModel.findById(flowId);
    if (!flow) {
      throw new Error('Flow not found');
    }

    if (flow.status !== 'active') {
      throw new Error('Flow is not active');
    }

    // Find start node
    const startNode = flow.nodes.find((node) => node.type === 'start');
    if (!startNode) {
      throw new Error('Flow has no start node');
    }

    // Create session
    const sessionId = uuidv4();
    const session = new this.chatSessionModel({
      sessionId,
      flowId: flow._id,
      userId,
      status: 'active',
      messages: [],
      currentNodeId: startNode.id,
      variables: {},
      metadata,
    });

    await session.save();

    // Create execution context
    const context: ExecutionContext = {
      sessionId,
      flowId: flowId,
      currentNodeId: startNode.id,
      variables: new Map(),
      messages: [],
      status: 'active',
    };

    this.activeSessions.set(sessionId, context);

    // Start execution from start node
    await this.executeNextNode(context, flow);

    return context;
  }

  /**
   * Process user input
   */
  async processUserInput(
    sessionId: string,
    userInput: string,
  ): Promise<ExecutionContext> {
    this.logger.log(`Processing user input for session: ${sessionId}`);

    const context = this.activeSessions.get(sessionId);
    if (!context) {
      throw new Error('Session not found');
    }

    if (!context.waitingForInput) {
      throw new Error('Not waiting for input');
    }

    // Get flow
    const flow = await this.flowModel.findById(context.flowId);
    if (!flow) {
      throw new Error('Flow not found');
    }

    // Find current input node
    const inputNode = flow.nodes.find((n) => n.id === context.inputNodeId);
    if (!inputNode || inputNode.type !== 'input') {
      throw new Error('Invalid input node');
    }

    // Validate input
    const validationResult = this.validateInput(userInput, inputNode.data);
    if (!validationResult.isValid) {
      // Send validation error message
      const errorMessage = {
        id: uuidv4(),
        role: 'bot' as const,
        content: validationResult.error || 'Invalid input',
        timestamp: new Date(),
        nodeId: inputNode.id,
      };
      context.messages.push(errorMessage);
      
      // Update session
      await this.updateSession(context);
      
      return context;
    }

    // Store input in variables
    if (inputNode.data.variableName) {
      context.variables.set(inputNode.data.variableName, validationResult.value);
    }

    // Add user message
    const userMessage = {
      id: uuidv4(),
      role: 'user' as const,
      content: userInput,
      timestamp: new Date(),
      nodeId: inputNode.id,
    };
    context.messages.push(userMessage);

    // Clear waiting state
    context.waitingForInput = false;
    context.inputNodeId = undefined;

    // Move to next node
    const nextNodeId = this.getNextNodeId(flow, inputNode.id);
    if (nextNodeId) {
      context.currentNodeId = nextNodeId;
      await this.executeNextNode(context, flow);
    } else {
      await this.endSession(context, 'completed');
    }

    return context;
  }

  /**
   * Execute the next node in the flow
   */
  private async executeNextNode(
    context: ExecutionContext,
    flow: FlowDocument,
  ): Promise<void> {
    const node = flow.nodes.find((n) => n.id === context.currentNodeId);
    if (!node) {
      this.logger.error(`Node ${context.currentNodeId} not found`);
      await this.endSession(context, 'error');
      return;
    }

    this.logger.log(`Executing node: ${node.id} (${node.type})`);

    try {
      switch (node.type) {
        case 'start':
          await this.executeStartNode(context, flow, node);
          break;
        case 'message':
          await this.executeMessageNode(context, flow, node);
          break;
        case 'input':
          await this.executeInputNode(context, flow, node);
          break;
        case 'condition':
          await this.executeConditionNode(context, flow, node);
          break;
        case 'api':
          await this.executeApiNode(context, flow, node);
          break;
        case 'delay':
          await this.executeDelayNode(context, flow, node);
          break;
        case 'jump':
          await this.executeJumpNode(context, flow, node);
          break;
        case 'end':
          await this.executeEndNode(context, flow, node);
          break;
        default:
          this.logger.error(`Unknown node type: ${node.type}`);
          await this.endSession(context, 'error');
      }

      // Update session
      await this.updateSession(context);
    } catch (error) {
      this.logger.error(`Error executing node: ${error.message}`);
      await this.endSession(context, 'error');
    }
  }

  /**
   * Execute start node
   */
  private async executeStartNode(
    context: ExecutionContext,
    flow: FlowDocument,
    node: any,
  ): Promise<void> {
    // Just move to next node
    const nextNodeId = this.getNextNodeId(flow, node.id);
    if (nextNodeId) {
      context.currentNodeId = nextNodeId;
      await this.executeNextNode(context, flow);
    }
  }

  /**
   * Execute message node
   */
  private async executeMessageNode(
    context: ExecutionContext,
    flow: FlowDocument,
    node: any,
  ): Promise<void> {
    // Interpolate variables in message
    let message = node.data.message || '';
    message = this.interpolateVariables(message, context.variables);

    // Send message
    const botMessage = {
      id: uuidv4(),
      role: 'bot' as const,
      content: message,
      timestamp: new Date(),
      nodeId: node.id,
      metadata: node.data.richContent ? { richContent: node.data.richContent } : undefined,
    };
    context.messages.push(botMessage);

    // Move to next node
    const nextNodeId = this.getNextNodeId(flow, node.id);
    if (nextNodeId) {
      context.currentNodeId = nextNodeId;
      await this.executeNextNode(context, flow);
    } else {
      await this.endSession(context, 'completed');
    }
  }

  /**
   * Execute input node
   */
  private async executeInputNode(
    context: ExecutionContext,
    flow: FlowDocument,
    node: any,
  ): Promise<void> {
    // Send input prompt
    const promptMessage = node.data.message || node.data.placeholder || 'Please provide input:';
    const botMessage = {
      id: uuidv4(),
      role: 'bot' as const,
      content: promptMessage,
      timestamp: new Date(),
      nodeId: node.id,
      metadata: {
        inputType: node.data.inputType,
        placeholder: node.data.placeholder,
        choices: node.data.choices,
      },
    };
    context.messages.push(botMessage);

    // Wait for user input
    context.waitingForInput = true;
    context.inputNodeId = node.id;
  }

  /**
   * Execute condition node
   */
  private async executeConditionNode(
    context: ExecutionContext,
    flow: FlowDocument,
    node: any,
  ): Promise<void> {
    const conditions = node.data.conditions || [];

    // Evaluate conditions
    for (const condition of conditions) {
      const variableValue = context.variables.get(condition.variable);
      const isMatch = this.evaluateCondition(
        variableValue,
        condition.operator,
        condition.value,
      );

      if (isMatch && condition.targetNodeId) {
        context.currentNodeId = condition.targetNodeId;
        await this.executeNextNode(context, flow);
        return;
      }
    }

    // No condition matched, use default or next edge
    if (node.data.defaultTarget) {
      context.currentNodeId = node.data.defaultTarget;
      await this.executeNextNode(context, flow);
    } else {
      const nextNodeId = this.getNextNodeId(flow, node.id);
      if (nextNodeId) {
        context.currentNodeId = nextNodeId;
        await this.executeNextNode(context, flow);
      } else {
        await this.endSession(context, 'completed');
      }
    }
  }

  /**
   * Execute API node (mock for now)
   */
  private async executeApiNode(
    context: ExecutionContext,
    flow: FlowDocument,
    node: any,
  ): Promise<void> {
    const apiConfig = node.data.apiConfig || {};

    // Mock API response
    const mockResponse = {
      status: 'success',
      data: { message: 'Mock API response' },
    };

    // Store response in variable
    if (apiConfig.responseVariable) {
      context.variables.set(apiConfig.responseVariable, mockResponse);
    }

    // Send confirmation message
    const botMessage = {
      id: uuidv4(),
      role: 'bot' as const,
      content: `API call to ${apiConfig.url} completed successfully.`,
      timestamp: new Date(),
      nodeId: node.id,
    };
    context.messages.push(botMessage);

    // Move to next node (success path)
    const nextNodeId = this.getNextNodeId(flow, node.id);
    if (nextNodeId) {
      context.currentNodeId = nextNodeId;
      await this.executeNextNode(context, flow);
    } else {
      await this.endSession(context, 'completed');
    }
  }

  /**
   * Execute delay node
   */
  private async executeDelayNode(
    context: ExecutionContext,
    flow: FlowDocument,
    node: any,
  ): Promise<void> {
    const delay = node.data.delay || 0;
    const displayMessage = node.data.displayMessage;

    // Send delay message if provided
    if (displayMessage) {
      const botMessage = {
        id: uuidv4(),
        role: 'bot' as const,
        content: displayMessage,
        timestamp: new Date(),
        nodeId: node.id,
      };
      context.messages.push(botMessage);
    }

    // Wait for delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Move to next node
    const nextNodeId = this.getNextNodeId(flow, node.id);
    if (nextNodeId) {
      context.currentNodeId = nextNodeId;
      await this.executeNextNode(context, flow);
    } else {
      await this.endSession(context, 'completed');
    }
  }

  /**
   * Execute jump node
   */
  private async executeJumpNode(
    context: ExecutionContext,
    flow: FlowDocument,
    node: any,
  ): Promise<void> {
    const targetNodeId = node.data.targetNodeId;

    if (targetNodeId) {
      context.currentNodeId = targetNodeId;
      await this.executeNextNode(context, flow);
    } else {
      this.logger.error('Jump node has no target');
      await this.endSession(context, 'error');
    }
  }

  /**
   * Execute end node
   */
  private async executeEndNode(
    context: ExecutionContext,
    flow: FlowDocument,
    node: any,
  ): Promise<void> {
    // Send end message if provided
    if (node.data.message) {
      const botMessage = {
        id: uuidv4(),
        role: 'bot' as const,
        content: node.data.message,
        timestamp: new Date(),
        nodeId: node.id,
      };
      context.messages.push(botMessage);
    }

    await this.endSession(context, 'completed');
  }

  /**
   * Get next node ID from edges
   */
  private getNextNodeId(flow: FlowDocument, currentNodeId: string): string | null {
    const edge = flow.edges.find((e) => e.source === currentNodeId);
    return edge ? edge.target : null;
  }

  /**
   * Interpolate variables in text
   */
  private interpolateVariables(text: string, variables: Map<string, any>): string {
    let result = text;
    variables.forEach((value, key) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, String(value));
    });
    return result;
  }

  /**
   * Validate user input
   */
  private validateInput(
    input: string,
    nodeData: any,
  ): { isValid: boolean; value?: any; error?: string } {
    const { inputType, validation } = nodeData;

    // Required check
    if (validation?.required && !input.trim()) {
      return { isValid: false, error: 'This field is required' };
    }

    // Type-specific validation
    switch (inputType) {
      case 'number':
        const num = parseFloat(input);
        if (isNaN(num)) {
          return { isValid: false, error: 'Please enter a valid number' };
        }
        if (validation?.min !== undefined && num < validation.min) {
          return { isValid: false, error: `Minimum value is ${validation.min}` };
        }
        if (validation?.max !== undefined && num > validation.max) {
          return { isValid: false, error: `Maximum value is ${validation.max}` };
        }
        return { isValid: true, value: num };

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          return { isValid: false, error: 'Please enter a valid email address' };
        }
        return { isValid: true, value: input };

      case 'choice':
        const choices = nodeData.choices || [];
        if (!choices.includes(input)) {
          return { isValid: false, error: 'Please select a valid option' };
        }
        return { isValid: true, value: input };

      case 'text':
      default:
        if (validation?.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(input)) {
            return { isValid: false, error: 'Invalid format' };
          }
        }
        if (validation?.min && input.length < validation.min) {
          return {
            isValid: false,
            error: `Minimum length is ${validation.min} characters`,
          };
        }
        if (validation?.max && input.length > validation.max) {
          return {
            isValid: false,
            error: `Maximum length is ${validation.max} characters`,
          };
        }
        return { isValid: true, value: input };
    }
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(value: any, operator: string, compareValue: any): boolean {
    switch (operator) {
      case '==':
        return value == compareValue;
      case '!=':
        return value != compareValue;
      case '>':
        return Number(value) > Number(compareValue);
      case '<':
        return Number(value) < Number(compareValue);
      case '>=':
        return Number(value) >= Number(compareValue);
      case '<=':
        return Number(value) <= Number(compareValue);
      case 'contains':
        return String(value).includes(String(compareValue));
      case 'startsWith':
        return String(value).startsWith(String(compareValue));
      case 'endsWith':
        return String(value).endsWith(String(compareValue));
      default:
        return false;
    }
  }

  /**
   * Update session in database
   */
  private async updateSession(context: ExecutionContext): Promise<void> {
    await this.chatSessionModel.findOneAndUpdate(
      { sessionId: context.sessionId },
      {
        currentNodeId: context.currentNodeId,
        messages: context.messages,
        variables: Object.fromEntries(context.variables),
        status: context.status,
      },
    );
  }

  /**
   * End session
   */
  private async endSession(
    context: ExecutionContext,
    status: 'completed' | 'abandoned' | 'error',
  ): Promise<void> {
    this.logger.log(`Ending session ${context.sessionId} with status: ${status}`);

    context.status = status;

    await this.chatSessionModel.findOneAndUpdate(
      { sessionId: context.sessionId },
      {
        status,
        endedAt: new Date(),
        messages: context.messages,
      },
    );

    // Update flow stats
    const session = await this.chatSessionModel.findOne({
      sessionId: context.sessionId,
    });
    if (session && session.duration !== undefined) {
      //const  default: FlowsService  = this.flowsService;
      // Note: This creates a circular dependency - better to emit an event
      // For now, we'll skip stats update and handle it via events later
    }

    this.activeSessions.delete(context.sessionId);
  }

  /**
   * Get session context
   */
  getSession(sessionId: string): ExecutionContext | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Reset session
   */
  async resetSession(sessionId: string): Promise<ExecutionContext> {
    const oldContext = this.activeSessions.get(sessionId);
    if (!oldContext) {
      throw new Error('Session not found');
    }

    // End old session
    await this.endSession(oldContext, 'abandoned');

    // Start new session with same flow
    return this.startSession(oldContext.flowId);
  }
}
