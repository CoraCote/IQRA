import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

interface CreateConversationDto {
    sessionId: string;
    type: 'voice' | 'chat';
    customerPhone?: string;
    restaurantId: string;
}

interface AddMessageDto {
    conversationId: string;
    role: 'user' | 'assistant';
    content: string;
    audioUrl?: string;
    transcription?: string;
}

@Injectable()
export class ConversationsService {
    constructor(private supabase: SupabaseService) { }

    async createConversation(data: CreateConversationDto) {
        const { data: conversation, error } = await this.supabase.client
            .from('conversations')
            .insert({
                session_id: data.sessionId,
                type: data.type,
                customer_phone: data.customerPhone,
                restaurant_id: data.restaurantId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating conversation:', error);
            throw new Error('Failed to create conversation');
        }

        console.log('✅ Created conversation:', conversation.id);
        return conversation;
    }

    async addMessage(data: AddMessageDto) {
        // First, get the conversation by session_id
        const { data: conversation } = await this.supabase.client
            .from('conversations')
            .select('id')
            .eq('session_id', data.conversationId)
            .single();

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        const startTime = Date.now();

        const { data: message, error } = await this.supabase.client
            .from('messages')
            .insert({
                conversation_id: conversation.id,
                role: data.role,
                content: data.content,
                audio_url: data.audioUrl,
                transcription: data.transcription,
                response_time_ms: Date.now() - startTime,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding message:', error);
            throw new Error('Failed to add message');
        }

        console.log('💬 Added message:', message.id);
        return message;
    }

    async getConversations(restaurantId?: string) {
        let query = this.supabase.client
            .from('conversations')
            .select(`
        *,
        messages (*)
      `)
            .order('created_at', { ascending: false });

        if (restaurantId) {
            query = query.eq('restaurant_id', restaurantId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching conversations:', error);
            throw new Error('Failed to fetch conversations');
        }

        return data;
    }

    async getMessagesByConversationId(conversationId: string) {
        const { data, error } = await this.supabase.client
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            throw new Error('Failed to fetch messages');
        }

        return data;
    }

    // Also add this method if not already present
    async getConversationBySessionId(sessionId: string) {
        const { data, error } = await this.supabase.client
            .from('conversations')
            .select(`
      *,
      messages (*)
    `)
            .eq('session_id', sessionId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching conversation by session ID:', error);
            throw new Error('Failed to fetch conversation');
        }

        return data;
    }
}

