import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        
        if (!apiKey || apiKey.includes('your-openai')) {
            console.warn('⚠️ OpenAI API key not configured. Using mock responses for development.');
            this.openai = null;
        } else {
            this.openai = new OpenAI({
                apiKey: apiKey,
            });
        }
    }

    async transcribeAudio(audioUrl: string): Promise<string> {
        try {
            console.log('🎵 Downloading audio from:', audioUrl);

            // Download audio file using fetch with proper buffer handling
            const response = await fetch(audioUrl);

            if (!response.ok) {
                throw new Error(`Failed to download audio: ${response.status} ${response.statusText}`);
            }

            // Convert response to ArrayBuffer, then to Buffer
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = Buffer.from(arrayBuffer);

            console.log('📁 Audio buffer size:', audioBuffer.length, 'bytes');

            // Create a Blob for OpenAI (works better than File in Node.js)
            const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });

            // Convert Blob to File
            const audioFile = new File([audioBlob], 'audio.wav', {
                type: 'audio/wav',
            });

            const transcription = await this.openai.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-1',
                language: 'en',
            });

            console.log('🎤 Transcription successful:', transcription.text);
            return transcription.text;
        } catch (error) {
            console.error('❌ Error transcribing audio:', error);

            // Provide more specific error messages
            if (error.message.includes('Failed to download')) {
                throw new Error('Unable to download audio file from Twilio');
            } else if (error.message.includes('Invalid file format')) {
                throw new Error('Audio file format not supported');
            } else {
                throw new Error(`Transcription failed: ${error.message}`);
            }
        }
    }

    async transcribeAudioBuffer(audioBuffer: Buffer): Promise<string> {
        try {
            if (!this.openai) {
                console.warn('⚠️ OpenAI not configured. Using mock transcription.');
                return 'Mock transcription: I heard your voice message.';
            }

            console.log('🎤 Transcribing audio buffer, size:', audioBuffer.length, 'bytes');

            // Create a Blob from the buffer
            const uint8Array = new Uint8Array(audioBuffer);
            const audioBlob = new Blob([uint8Array], { type: 'audio/wav' });

            // Convert Blob to File
            const audioFile = new File([audioBlob], 'audio.wav', {
                type: 'audio/wav',
            });

            const transcription = await this.openai.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-1',
                language: 'en',
            });

            console.log('🎤 Transcription successful:', transcription.text);
            return transcription.text;
        } catch (error) {
            console.error('❌ Error transcribing audio buffer:', error);
            return 'I had trouble understanding your voice message. Please try again.';
        }
    }

    async generateResponse(userMessage: string, type: 'voice' | 'chat'): Promise<string> {
        // If OpenAI is not configured, provide mock responses
        if (!this.openai) {
            console.log('🤖 Using mock response (OpenAI not configured)');
            return this.getMockResponse(userMessage, type);
        }

        const systemPrompt = `You are a friendly AI assistant for a restaurant. You help customers with:
1. Answering questions about the menu
2. Taking food orders  
3. Providing information about the restaurant

Keep responses concise and helpful. For voice interactions, speak naturally as if you're talking to someone on the phone.

Current context: This is a ${type} interaction.`;

        try {
            console.log(`🤖 Generating ${type} response for:`, userMessage);

            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                max_tokens: 150,
                temperature: 0.7,
            });

            const response = completion.choices[0]?.message?.content ||
                'I apologize, but I didn\'t understand that. Could you please repeat?';

            console.log('✅ AI Response generated:', response);
            return response;
        } catch (error) {
            console.error('❌ Error generating AI response:', error);

            // Handle different OpenAI errors and fallback to mock responses
            if (error.status === 401) {
                console.log('⚠️ OpenAI API key is invalid, using mock response');
                return this.getMockResponse(userMessage, type);
            } else if (error.status === 429) {
                console.log('⚠️ OpenAI API rate limit exceeded, using mock response');
                return this.getMockResponse(userMessage, type);
            } else if (error.status === 403) {
                console.log('⚠️ OpenAI API not supported in this region, using mock response');
                return this.getMockResponse(userMessage, type);
            } else if (error.status === 500) {
                console.log('⚠️ OpenAI service temporarily unavailable, using mock response');
                return this.getMockResponse(userMessage, type);
            } else {
                console.log('⚠️ OpenAI error occurred, using mock response:', error.message);
                return this.getMockResponse(userMessage, type);
            }
        }
    }

    private getMockResponse(userMessage: string, type: 'voice' | 'chat'): string {
        const message = userMessage.toLowerCase();
        
        // Mock responses for common restaurant queries
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
        
        // Default response
        return "Thank you for your message! I'm here to help you with your restaurant needs. I can assist with menu questions, take your order, or provide information about our services. What would you like to know?";
    }

    // Helper method to test OpenAI connection
    async testConnection(): Promise<boolean> {
        if (!this.openai) {
            console.log('⚠️ OpenAI not configured, using mock responses');
            return false;
        }
        
        try {
            await this.openai.models.list();
            console.log('✅ OpenAI connection successful');
            return true;
        } catch (error) {
            console.error('❌ OpenAI connection failed:', error.message);
            return false;
        }
    }
}