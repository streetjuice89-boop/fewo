import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { BotService } from './bot.service';

interface SendMessagePayload {
  sessionId: string;
  content: string;
  locale?: 'de' | 'en';
}

interface JoinSessionPayload {
  sessionId: string;
}

interface CreateSessionPayload {
  userId?: string;
  visitorId?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, { sessionId?: string; isAdmin?: boolean }> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly botService: BotService
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, {});
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('createSession')
  async handleCreateSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateSessionPayload
  ) {
    try {
      const session = await this.chatService.createSession(
        payload.userId,
        payload.visitorId
      );

      // Join the session room
      client.join(`session:${session.id}`);
      this.connectedClients.set(client.id, { sessionId: session.id });

      // Send welcome message from bot
      const welcomeMessage = await this.chatService.addMessage(
        session.id,
        'Willkommen bei VoyageNest! Wie kann ich Ihnen helfen?',
        undefined,
        true
      );

      // Emit session created with welcome message
      client.emit('sessionCreated', {
        session,
        message: welcomeMessage,
      });

      // Notify admins about new session
      this.server.to('admins').emit('newSession', session);
    } catch (error) {
      client.emit('error', { message: 'Failed to create session' });
    }
  }

  @SubscribeMessage('joinSession')
  async handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinSessionPayload
  ) {
    try {
      const session = await this.chatService.getSession(payload.sessionId);

      client.join(`session:${session.id}`);
      this.connectedClients.set(client.id, {
        ...this.connectedClients.get(client.id),
        sessionId: session.id,
      });

      client.emit('sessionJoined', {
        session,
        messages: session.messages,
      });
    } catch (error) {
      client.emit('error', { message: 'Session not found' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload
  ) {
    try {
      const { sessionId, content, locale = 'de' } = payload;
      const clientData = this.connectedClients.get(client.id);

      // Save user message
      const userMessage = await this.chatService.addMessage(
        sessionId,
        content,
        clientData?.isAdmin ? client.id : undefined,
        false
      );

      // Broadcast user message to room
      this.server.to(`session:${sessionId}`).emit('newMessage', userMessage);

      // Get session to check if bot is active
      const session = await this.chatService.getSession(sessionId);

      if (session.isBot) {
        // Process with bot
        const botResponse = this.botService.processMessage(content, locale);

        // Save bot response
        const botMessage = await this.chatService.addMessage(
          sessionId,
          botResponse.answer,
          undefined,
          true
        );

        // Broadcast bot response
        this.server.to(`session:${sessionId}`).emit('newMessage', botMessage);

        // Check if should escalate
        if (botResponse.shouldEscalate || this.botService.wantsHumanAgent(content)) {
          this.server.to('admins').emit('escalationRequested', {
            sessionId,
            session,
          });

          const escalationMessage = await this.chatService.addMessage(
            sessionId,
            locale === 'de'
              ? 'Ein Mitarbeiter wird sich in Kürze bei Ihnen melden. Bitte haben Sie einen Moment Geduld.'
              : 'A team member will be with you shortly. Please hold on.',
            undefined,
            true
          );

          this.server.to(`session:${sessionId}`).emit('newMessage', escalationMessage);
        }
      }
    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('adminJoin')
  async handleAdminJoin(@ConnectedSocket() client: Socket) {
    client.join('admins');
    this.connectedClients.set(client.id, {
      ...this.connectedClients.get(client.id),
      isAdmin: true,
    });

    const activeSessions = await this.chatService.getActiveSessions();
    client.emit('activeSessions', activeSessions);
  }

  @SubscribeMessage('adminTakeOver')
  async handleAdminTakeOver(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; adminId: string }
  ) {
    try {
      const { sessionId, adminId } = payload;

      await this.chatService.escalateToAdmin(sessionId, adminId);

      client.join(`session:${sessionId}`);

      // Notify session participants
      const takeOverMessage = await this.chatService.addMessage(
        sessionId,
        'Ein Mitarbeiter hat den Chat übernommen.',
        undefined,
        true
      );

      this.server.to(`session:${sessionId}`).emit('newMessage', takeOverMessage);
      this.server.to(`session:${sessionId}`).emit('adminJoined', { adminId });
    } catch (error) {
      client.emit('error', { message: 'Failed to take over session' });
    }
  }

  @SubscribeMessage('closeSession')
  async handleCloseSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinSessionPayload
  ) {
    try {
      await this.chatService.closeSession(payload.sessionId);

      this.server.to(`session:${payload.sessionId}`).emit('sessionClosed');
      this.server.to('admins').emit('sessionClosed', { sessionId: payload.sessionId });
    } catch (error) {
      client.emit('error', { message: 'Failed to close session' });
    }
  }
}

