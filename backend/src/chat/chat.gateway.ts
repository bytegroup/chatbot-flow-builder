import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {FlowExecutorService} from "./services/flow-executor.service";

interface ChatStartPayload {
  flowId: string;
  metadata?: any;
}

interface ChatMessagePayload {
  sessionId: string;
  message: string;
}

interface ChatResetPayload {
  sessionId: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedClients = new Map<string, Socket>();

  constructor(
      private readonly flowExecutorService: FlowExecutorService
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // Send connection confirmation
    client.emit('chat:connected', {
      message: 'Connected to chat server',
      clientId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  /**
   * Start a new chat session
   */
  @SubscribeMessage('chat:start')
  async handleChatStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ChatStartPayload,
  ) {
    try {
      this.logger.log(`Starting chat session for flow: ${data.flowId}`);

      // Get user ID from socket (if authenticated)
      const userId = (client as any).user?.userId;

      // Start session
      const context = await this.flowExecutorService.startSession(
        data.flowId,
        userId,
        data.metadata,
      );

      // Send session started event
      client.emit('chat:session_started', {
        sessionId: context.sessionId,
        flowId: context.flowId,
      });

      // Send initial messages
      for (const message of context.messages) {
        client.emit('chat:bot_message', {
          sessionId: context.sessionId,
          message: {
            id: message.id,
            content: message.content,
            timestamp: message.timestamp,
            metadata: message.metadata,
          },
        });
      }

      // If waiting for input, send prompt
      if (context.waitingForInput) {
        client.emit('chat:waiting_input', {
          sessionId: context.sessionId,
          nodeId: context.inputNodeId,
        });
      }

      return {
        success: true,
        sessionId: context.sessionId,
      };
    } catch (error) {
      this.logger.error(`Error starting chat: ${error.message}`);
      client.emit('chat:error', {
        message: error.message || 'Failed to start chat session',
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process user message
   */
  @SubscribeMessage('chat:message')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ChatMessagePayload,
  ) {
    try {
      this.logger.log(
        `Processing message for session: ${data.sessionId}`,
      );

      // Show typing indicator
      client.emit('chat:typing', {
        sessionId: data.sessionId,
        isTyping: true,
      });

      // Process user input
      const context = await this.flowExecutorService.processUserInput(
        data.sessionId,
        data.message,
      );

      // Stop typing indicator
      client.emit('chat:typing', {
        sessionId: data.sessionId,
        isTyping: false,
      });

      // Send new messages
      const lastMessages = context.messages.slice(-5); // Send last 5 messages
      for (const message of lastMessages) {
        if (message.role === 'bot' || message.role === 'system') {
          client.emit('chat:bot_message', {
            sessionId: context.sessionId,
            message: {
              id: message.id,
              content: message.content,
              timestamp: message.timestamp,
              metadata: message.metadata,
            },
          });
        }
      }

      // Check if waiting for more input
      if (context.waitingForInput) {
        client.emit('chat:waiting_input', {
          sessionId: context.sessionId,
          nodeId: context.inputNodeId,
        });
      }

      // Check if session ended
      if (context.status !== 'active') {
        client.emit('chat:session_ended', {
          sessionId: context.sessionId,
          status: context.status,
        });
      }

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
      client.emit('chat:error', {
        sessionId: data.sessionId,
        message: error.message || 'Failed to process message',
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reset chat session
   */
  @SubscribeMessage('chat:reset')
  async handleChatReset(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ChatResetPayload,
  ) {
    try {
      this.logger.log(`Resetting session: ${data.sessionId}`);

      // Reset session
      const context = await this.flowExecutorService.resetSession(data.sessionId);

      // Send reset confirmation
      client.emit('chat:session_reset', {
        oldSessionId: data.sessionId,
        newSessionId: context.sessionId,
      });

      // Send initial messages
      for (const message of context.messages) {
        client.emit('chat:bot_message', {
          sessionId: context.sessionId,
          message: {
            id: message.id,
            content: message.content,
            timestamp: message.timestamp,
            metadata: message.metadata,
          },
        });
      }

      // If waiting for input, send prompt
      if (context.waitingForInput) {
        client.emit('chat:waiting_input', {
          sessionId: context.sessionId,
          nodeId: context.inputNodeId,
        });
      }

      return {
        success: true,
        sessionId: context.sessionId,
      };
    } catch (error) {
      this.logger.error(`Error resetting chat: ${error.message}`);
      client.emit('chat:error', {
        message: error.message || 'Failed to reset chat session',
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get session info
   */
  @SubscribeMessage('chat:get_session')
  async handleGetSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    try {
      const context = this.flowExecutorService.getSession(data.sessionId);

      if (!context) {
        throw new Error('Session not found');
      }

      return {
        success: true,
        session: {
          sessionId: context.sessionId,
          flowId: context.flowId,
          status: context.status,
          waitingForInput: context.waitingForInput,
          messageCount: context.messages.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(sessionId: string, isTyping: boolean) {
    this.server.emit('chat:typing', {
      sessionId,
      isTyping,
    });
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcastMessage(event: string, data: any) {
    this.server.emit(event, data);
  }
}
