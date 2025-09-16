import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { OpenAIModule } from '../openai/openai.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
    imports: [
        OpenAIModule, 
        ConversationsModule,
        MulterModule.register({
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB limit
            },
        }),
    ],
    providers: [TwilioService],
    controllers: [TwilioController],
    exports: [TwilioService],
})
export class TwilioModule { }