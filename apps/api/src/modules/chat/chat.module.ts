import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { BotService } from './bot.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, BotService],
  exports: [ChatService],
})
export class ChatModule {}

