import { UserActivityInterceptor } from '@/shared/interceptors/userActivity.interceptor';
import { TransformInterceptor } from '@/shared/interceptors/transform.interceptor';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerOptions } from '@/swagger/swagger.options';
import { swaggerConfig } from '@/swagger/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const application = await NestFactory.create(AppModule);
    const configService = application.get<ConfigService>(ConfigService);
    const logger = new Logger('Main');

    application.setGlobalPrefix('/api/');
    enableSwagger(application, 'api/docs');

    application.useGlobalInterceptors(
        new TransformInterceptor(),
        new UserActivityInterceptor(),
    );
    application.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    application.enableCors({
        origin: ['http://localhost:3000', 'http://185.20.227.119:5000'],
    });

    await application.listen(Number(configService.getOrThrow('BACKEND_PORT')));
    logger.log(`Application is running on: ${await application.getUrl()}`);
}

function enableSwagger(application: INestApplication, path: string) {
    const document = SwaggerModule.createDocument(application, swaggerConfig);
    const options = new SwaggerOptions();
    options.setDarkTheme();

    SwaggerModule.setup(path, application, document, options);
}

bootstrap();
