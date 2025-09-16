import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { ConversationsService } from '../conversations/conversations.service';

interface ChatMessage {
    message: string;
    sessionId: string;
    restaurantId?: string;
}

@Injectable()
export class ChatService {
    constructor(
        private openAIService: OpenAIService,
        private conversationsService: ConversationsService,
    ) { }

    async handleChatMessage(data: ChatMessage): Promise<string> {
        try {
            // Create conversation if it doesn't exist
            try {
                await this.conversationsService.createConversation({
                    sessionId: data.sessionId,
                    type: 'chat',
                    restaurantId: data.restaurantId || 'default',
                });
            } catch (error) {
                // Conversation might already exist or database not configured, continue
                console.log('Conversation creation skipped:', error.message);
            }

            // Save user message (skip if database not configured)
            try {
                await this.conversationsService.addMessage({
                    conversationId: data.sessionId,
                    role: 'user',
                    content: data.message,
                });
            } catch (error) {
                console.log('Message saving skipped:', error.message);
            }

            // Generate AI response
            const response = await this.openAIService.generateResponse(
                data.message,
                'chat',
            );

            // Save AI response (skip if database not configured)
            try {
                await this.conversationsService.addMessage({
                    conversationId: data.sessionId,
                    role: 'assistant',
                    content: response,
                });
            } catch (error) {
                console.log('AI response saving skipped:', error.message);
            }

            return response;
        } catch (error) {
            console.error('Error in chat service:', error);
            
            // Always provide a fallback response instead of throwing
            console.log('🔄 Falling back to mock response due to error');
            return this.getFallbackResponse(data.message);
        }
    }

    private getFallbackResponse(userMessage: string): string {
        const message = userMessage.toLowerCase();
        
        // Fallback responses for common restaurant queries
        if (message.includes('birthday') || message.includes('cake')) {
            return "I'd be happy to help you with a birthday cake! We have several delicious options including chocolate, vanilla, and strawberry cakes. What size would you like and when do you need it?";
        }
        
        if (message.includes('noodle') || message.includes('pasta')) {
            return "Great choice! We have a variety of noodle dishes including spaghetti, fettuccine, and ramen. Would you like to know about our pasta specials or specific noodle dishes?";
        }
        
        if (message.includes('menu') || message.includes('food')) {
            return "I'd be happy to tell you about our menu! We offer a wide selection of appetizers, main courses, desserts, and beverages. What type of cuisine are you interested in?";
        }
        
        if (message.includes('order') || message.includes('buy')) {
            return "I can help you place an order! What would you like to order today? I can tell you about our specials and help you customize your meal.";
        }
        
        if (message.includes('hello') || message.includes('hi')) {
            return "Hello! Welcome to our restaurant! I'm here to help you with your order, answer questions about our menu, or assist with any special requests. How can I help you today?";
        }
        
        // Default fallback response
        return "Thank you for your message! I'm here to help you with your restaurant needs. I can assist with menu questions, take your order, or provide information about our services. What would you like to know?";
    }

    async getChatHistory(sessionId: string) {
        return this.conversationsService.getConversationBySessionId(sessionId);
    }
}