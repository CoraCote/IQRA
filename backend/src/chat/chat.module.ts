import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { OpenAIModule } from '../openai/openai.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
    imports: [OpenAIModule, ConversationsModule],
    providers: [ChatGateway, ChatService],
})
export class ChatModule { }