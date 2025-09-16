import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DatabaseModule } from '../database/database.module';
import { OpenAIModule } from '../openai/openai.module';

@Module({
    imports: [DatabaseModule, OpenAIModule],
    controllers: [HealthController],
})
export class HealthModule { }
