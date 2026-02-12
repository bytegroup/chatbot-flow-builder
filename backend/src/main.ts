import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import {ConfigService} from '@nestjs/config';
import {AppModule} from './app.module';
import {AppLogger} from "./common/app-logger.service";
import {LoggerMiddleware} from "./middleware/logger.middleware";
import {LoggingInterceptor} from "./common/logging.interceptor";
import {GlobalExceptionFilter} from "./common/global-exception.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Get config service
    const configService = app.get(ConfigService);

    const logger = app.get(AppLogger);
    app.useGlobalInterceptors(new LoggingInterceptor(logger));
    app.useGlobalFilters(new GlobalExceptionFilter(logger));

    // Enable CORS
    app.enableCors({
        origin: configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000',
        credentials: true,
    });

    // Global prefix for all routes
    app.setGlobalPrefix('api');

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strip properties that don't have decorators
            forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
            transform: true, // Automatically transform payloads to DTO instances
            transformOptions: {
                enableImplicitConversion: true, // Allow implicit type conversion
            },
        }),
    );

    // Swagger API Documentation
    const config = new DocumentBuilder()
        .setTitle('Chatbot Flow Builder API')
        .setDescription('API documentation for Chatbot Flow Builder backend')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Authentication', 'User authentication and authorization')
        .addTag('Users', 'User management')
        .addTag('Flows', 'Flow management (to be implemented)')
        .addTag('Chat', 'Chat and flow execution (to be implemented)')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

    // Start server
    const port = configService.get<number>('PORT') || 3001;
    await app.listen(port);
    console.log(`
      🚀 Application is running on: http://localhost:${port}
      📚 API Documentation: http://localhost:${port}/api/docs
      🔐 Authentication endpoints ready
    `);
}

bootstrap();
