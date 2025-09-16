import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateConversationDto {
    @IsString()
    sessionId: string;

    @IsEnum(['voice', 'chat'])
    type: 'voice' | 'chat';

    @IsOptional()
    @IsString()
    customerPhone?: string;

    @IsString()
    restaurantId: string;
}

export class AddMessageDto {
    @IsString()
    conversationId: string;

    @IsEnum(['user', 'assistant'])
    role: 'user' | 'assistant';

    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    audioUrl?: string;

    @IsOptional()
    @IsString()
    transcription?: string;
}
