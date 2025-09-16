import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    
    try {
        const app = await NestFactory.create(AppModule);
        const configService = app.get(ConfigService);

        // Security middleware
        app.use(helmet());
        app.use(compression());

        // Global validation pipe
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));

        // CORS configuration
        app.enableCors({
            origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        });

        const port = configService.get('PORT') || 3001;
        await app.listen(port);
        
        logger.log(`🚀 AI Restaurant Assistant API running on port ${port}`);
        logger.log(`🌐 Environment: ${configService.get('NODE_ENV') || 'development'}`);
        logger.log(`📱 Frontend URL: ${configService.get('FRONTEND_URL') || 'http://localhost:3000'}`);
        
    } catch (error) {
        logger.error('❌ Failed to start application:', error);
        process.exit(1);
    }
}

bootstrap();