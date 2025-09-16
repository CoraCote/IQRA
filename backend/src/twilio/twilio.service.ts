import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { OpenAIService } from '../openai/openai.service';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class TwilioService {
    private client: twilio.Twilio;

    constructor(
        private configService: ConfigService,
        private openAIService: OpenAIService,
        private conversationsService: ConversationsService,
    ) {
        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        this.client = twilio(accountSid, authToken);
    }

    async handleIncomingCall(callSid: string, from: string) {
        console.log(`📞 Incoming call from ${from}, SID: ${callSid}`);

        // Create conversation
        const conversation = await this.conversationsService.createConversation({
            sessionId: callSid,
            type: 'voice',
            customerPhone: from,
            restaurantId: 'default', // Will be dynamic later
        });

        return this.generateWelcomeTwiML();
    }

    generateWelcomeTwiML(): string {
        const twiml = new twilio.twiml.VoiceResponse();

        twiml.say({
            voice: 'alice',
        }, 'Hello! Welcome to our restaurant. I\'m your AI assistant. How can I help you today?');

        twiml.record({
            timeout: 10,
            transcribe: false,
            action: '/twilio/voice/process',
            method: 'POST',
        });

        return twiml.toString();
    }

    async processVoiceRecording(callSid: string, recordingUrl: string) {
        console.log(`🎵 Processing recording for call ${callSid}: ${recordingUrl}`);

        try {
            // Download and transcribe audio
            const transcription = await this.openAIService.transcribeAudio(recordingUrl);

            // Get AI response
            const response = await this.openAIService.generateResponse(transcription, 'voice');

            // Save message to database
            await this.conversationsService.addMessage({
                conversationId: callSid,
                role: 'user',
                content: transcription,
                audioUrl: recordingUrl,
            });

            await this.conversationsService.addMessage({
                conversationId: callSid,
                role: 'assistant',
                content: response,
            });

            return this.generateResponseTwiML(response);
        } catch (error) {
            console.error('Error processing voice recording:', error);
            return this.generateErrorTwiML();
        }
    }

    generateResponseTwiML(response: string): string {
        const twiml = new twilio.twiml.VoiceResponse();

        twiml.say({
            voice: 'alice',
        }, response);

        // Continue conversation
        twiml.record({
            timeout: 10,
            transcribe: false,
            action: '/twilio/voice/process',
            method: 'POST',
        });

        return twiml.toString();
    }

    generateErrorTwiML(): string {
        const twiml = new twilio.twiml.VoiceResponse();

        twiml.say({
            voice: 'alice',
        }, 'I apologize, but I\'m having trouble understanding. Please try calling again.');

        twiml.hangup();
        return twiml.toString();
    }

    async processWebVoiceRecording(
        audioFile: Express.Multer.File,
        sessionId: string,
        restaurantId: string
    ) {
        console.log(`🎵 Processing web voice recording for session ${sessionId}`);

        try {
            // Create conversation if it doesn't exist
            let conversation;
            try {
                conversation = await this.conversationsService.createConversation({
                    sessionId,
                    type: 'voice',
                    restaurantId,
                });
            } catch (error) {
                // Conversation might already exist
                console.log('Conversation might already exist:', error.message);
            }

            // Transcribe audio using OpenAI Whisper
            const transcription = await this.openAIService.transcribeAudioBuffer(audioFile.buffer);

            // Generate AI response
            const response = await this.openAIService.generateResponse(transcription, 'voice');

            // Save messages to database
            try {
                await this.conversationsService.addMessage({
                    conversationId: sessionId,
                    role: 'user',
                    content: transcription,
                });

                await this.conversationsService.addMessage({
                    conversationId: sessionId,
                    role: 'assistant',
                    content: response,
                });
            } catch (error) {
                console.log('Message saving skipped:', error.message);
            }

            console.log('✅ Web voice processing completed');
            return {
                transcription,
                response
            };
        } catch (error) {
            console.error('Error processing web voice recording:', error);
            throw error;
        }
    }
}