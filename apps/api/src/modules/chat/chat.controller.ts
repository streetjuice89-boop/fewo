import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all chat sessions (admin only)' })
  async getAllSessions(
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.chatService.getAllSessions(page, limit);
  }

  @Get('sessions/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active chat sessions (admin only)' })
  async getActiveSessions() {
    return this.chatService.getActiveSessions();
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get chat session by ID' })
  async getSession(@Param('id') id: string) {
    return this.chatService.getSession(id);
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: 'Get messages for a session' })
  async getMessages(@Param('id') id: string) {
    return this.chatService.getMessages(id);
  }

  @Post('sessions/:id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close chat session (admin only)' })
  async closeSession(@Param('id') id: string) {
    return this.chatService.closeSession(id);
  }
}

