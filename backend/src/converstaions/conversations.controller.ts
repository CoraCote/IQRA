import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto, AddMessageDto } from './dto/create-conversation.dto';

@Controller('conversations')
export class ConversationsController {
    constructor(private readonly conversationsService: ConversationsService) { }

    @Post()
    async createConversation(@Body() createConversationDto: CreateConversationDto) {
        try {
            const conversation = await this.conversationsService.createConversation(createConversationDto);
            return {
                success: true,
                data: conversation,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Post(':id/messages')
    async addMessage(
        @Param('id') conversationId: string,
        @Body() addMessageDto: Omit<AddMessageDto, 'conversationId'>,
    ) {
        try {
            const message = await this.conversationsService.addMessage({
                ...addMessageDto,
                conversationId,
            });
            return {
                success: true,
                data: message,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get()
    async getConversations(@Query('restaurantId') restaurantId?: string) {
        try {
            const conversations = await this.conversationsService.getConversations(restaurantId);
            return {
                success: true,
                data: conversations,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get(':sessionId')
    async getConversationBySessionId(@Param('sessionId') sessionId: string) {
        try {
            const conversation = await this.conversationsService.getConversationBySessionId(sessionId);
            return {
                success: true,
                data: conversation,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get(':id/messages')
    async getMessages(@Param('id') conversationId: string) {
        try {
            // You'll need to implement this method in the service
            const messages = await this.conversationsService.getMessagesByConversationId(conversationId);
            return {
                success: true,
                data: messages,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}