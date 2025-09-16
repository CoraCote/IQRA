import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioModule } from './twilio/twilio.module';
import { OpenAIModule } from './openai/openai.module';
import { ConversationsModule } from './conversations/conversations.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        DatabaseModule,
        HealthModule,
        TwilioModule,
        OpenAIModule,
        ConversationsModule,
        ChatModule,
    ],
})
export class AppModule { }