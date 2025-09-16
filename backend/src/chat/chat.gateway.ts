import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface ChatMessage {
    message: string;
    sessionId: string;
    restaurantId?: string;
}

@WebSocketGateway({
    cors: {
        origin: (origin, callback) => {
            let allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
            if (allowedOrigin.endsWith('/')) {
                allowedOrigin = allowedOrigin.slice(0, -1); // remove trailing slash
            }

            if (!origin || origin === allowedOrigin) {
                callback(null, true);
            } else {
                callback(new Error(`CORS blocked for origin: ${origin}`));
            }
        },
        credentials: true,
        methods: ['GET', 'POST'],
    },
})

export class ChatGateway {
    @WebSocketServer()
    server: Server;

    constructor(private chatService: ChatService) { }

    @SubscribeMessage('chat_message')
    async handleMessage(
        @MessageBody() data: ChatMessage,
        @ConnectedSocket() client: Socket,
    ) {
        console.log('💬 Chat message received:', data);

        try {
            const response = await this.chatService.handleChatMessage(data);

            // Send response back to client
            client.emit('chat_response', {
                message: response,
                sessionId: data.sessionId,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Error handling chat message:', error);

            client.emit('chat_error', {
                error: 'Sorry, I encountered an error. Please try again.',
                sessionId: data.sessionId,
            });
        }
    }

    @SubscribeMessage('join_session')
    handleJoinSession(
        @MessageBody() data: { sessionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.join(data.sessionId);
        console.log(`👤 Client joined session: ${data.sessionId}`);
    }

    @SubscribeMessage('get_chat_history')
    async handleGetChatHistory(
        @MessageBody() data: { sessionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const conversation = await this.chatService.getChatHistory(data.sessionId);

            client.emit('chat_history', {
                sessionId: data.sessionId,
                messages: conversation?.messages || [],
            });
        } catch (error) {
            console.error('Error fetching chat history:', error);

            client.emit('chat_error', {
                error: 'Failed to load chat history',
                sessionId: data.sessionId,
            });
        }
    }
}