import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new chat session
   */
  async createSession(userId?: string, visitorId?: string) {
    return this.prisma.chatSession.create({
      data: {
        userId,
        visitorId,
        isBot: true,
        status: 'active',
      },
    });
  }

  /**
   * Get session by ID
   */
  async getSession(id: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        admin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    return session;
  }

  /**
   * Get all active sessions (for admin)
   */
  async getActiveSessions() {
    return this.prisma.chatSession.findMany({
      where: { status: 'active' },
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  /**
   * Get all sessions with pagination
   */
  async getAllSessions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      this.prisma.chatSession.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      this.prisma.chatSession.count(),
    ]);

    return {
      data: sessions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Add message to session
   */
  async addMessage(sessionId: string, content: string, senderId?: string, isBot = false) {
    // Update session timestamp
    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return this.prisma.chatMessage.create({
      data: {
        sessionId,
        senderId,
        content,
        isBot,
      },
    });
  }

  /**
   * Escalate session to human admin
   */
  async escalateToAdmin(sessionId: string, adminId: string) {
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        isBot: false,
        adminId,
      },
    });
  }

  /**
   * Close chat session
   */
  async closeSession(sessionId: string) {
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { status: 'closed' },
    });
  }

  /**
   * Get messages for a session
   */
  async getMessages(sessionId: string) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }
}

