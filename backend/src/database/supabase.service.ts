import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;
    private logger = new Logger(SupabaseService.name);

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        // Force mock client for development/testing
        const forceMock = process.env.NODE_ENV === 'development' || process.env.FORCE_MOCK_DB === 'true';
        
        if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id') || supabaseKey.includes('your-supabase') || forceMock) {
            this.logger.warn('⚠️ Supabase credentials not configured. Using mock client for development.');
            this.supabase = this.createMockClient();
        } else {
            this.supabase = createClient(supabaseUrl, supabaseKey);
            this.logger.log('✅ Supabase client initialized successfully');
        }
    }

    private createMockClient(): SupabaseClient {
        // Create a mock client that simulates successful database operations
        const mockConversations = new Map();
        const mockMessages = new Map();
        let conversationIdCounter = 1;
        let messageIdCounter = 1;

        return {
            from: (table: string) => {
                if (table === 'conversations') {
                    return {
                        insert: (data: any) => ({
                            select: () => ({
                                single: () => {
                                    const conversation = {
                                        id: conversationIdCounter++,
                                        ...data,
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString()
                                    };
                                    mockConversations.set(conversation.id, conversation);
                                    return Promise.resolve({ data: conversation, error: null });
                                }
                            })
                        }),
                        select: (columns?: string) => ({
                            eq: (column: string, value: any) => ({
                                single: () => {
                                    const conversation = Array.from(mockConversations.values())
                                        .find(conv => conv[column] === value);
                                    return Promise.resolve({ 
                                        data: conversation || null, 
                                        error: conversation ? null : { message: 'Conversation not found', code: 'PGRST116' }
                                    });
                                }
                            }),
                            order: (column: string, options?: any) => {
                                const conversations = Array.from(mockConversations.values())
                                    .sort((a, b) => {
                                        const aVal = new Date(a[column]).getTime();
                                        const bVal = new Date(b[column]).getTime();
                                        return options?.ascending ? aVal - bVal : bVal - aVal;
                                    });
                                return Promise.resolve({ data: conversations, error: null });
                            }
                        })
                    };
                } else if (table === 'messages') {
                    return {
                        insert: (data: any) => ({
                            select: () => ({
                                single: () => {
                                    const message = {
                                        id: messageIdCounter++,
                                        ...data,
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString()
                                    };
                                    mockMessages.set(message.id, message);
                                    return Promise.resolve({ data: message, error: null });
                                }
                            })
                        }),
                        select: (columns?: string) => ({
                            eq: (column: string, value: any) => ({
                                order: (orderColumn: string, options?: any) => {
                                    const messages = Array.from(mockMessages.values())
                                        .filter(msg => msg[column] === value)
                                        .sort((a, b) => {
                                            const aVal = new Date(a[orderColumn]).getTime();
                                            const bVal = new Date(b[orderColumn]).getTime();
                                            return options?.ascending ? aVal - bVal : bVal - aVal;
                                        });
                                    return Promise.resolve({ data: messages, error: null });
                                }
                            })
                        })
                    };
                }
                return {} as any;
            }
        } as any;
    }

    get client(): SupabaseClient {
        return this.supabase;
    }
}