import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../database/supabase.service';
import { OpenAIService } from '../openai/openai.service';

@Controller('health')
export class HealthController {
    constructor(
        private configService: ConfigService,
        private supabase: SupabaseService,
        private openai: OpenAIService,
    ) {}

    @Get()
    async checkHealth() {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: this.configService.get('NODE_ENV') || 'development',
            services: {
                database: 'unknown',
                openai: 'unknown',
            },
        };

        try {
            // Check database connection
            const { error: dbError } = await this.supabase.client
                .from('restaurants')
                .select('id')
                .limit(1);
            
            health.services.database = dbError ? 'error' : 'ok';
        } catch (error) {
            health.services.database = 'error';
        }

        try {
            // Check OpenAI connection
            const isOpenAIHealthy = await this.openai.testConnection();
            health.services.openai = isOpenAIHealthy ? 'ok' : 'error';
        } catch (error) {
            health.services.openai = 'error';
        }

        // Overall status
        const allServicesHealthy = Object.values(health.services).every(status => status === 'ok');
        health.status = allServicesHealthy ? 'ok' : 'degraded';

        return health;
    }

    @Get('ready')
    async checkReadiness() {
        const health = await this.checkHealth();
        
        if (health.status === 'ok') {
            return { status: 'ready', timestamp: new Date().toISOString() };
        } else {
            return { 
                status: 'not ready', 
                timestamp: new Date().toISOString(),
                issues: Object.entries(health.services)
                    .filter(([_, status]) => status !== 'ok')
                    .map(([service, status]) => `${service}: ${status}`)
            };
        }
    }
}
