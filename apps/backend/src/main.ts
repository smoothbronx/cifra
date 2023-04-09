import { TransformInterceptor } from '@/shared/interceptors/transform.interceptor';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SwaggerOptions } from '@/swagger/swagger.options';
import { swaggerConfig } from '@/swagger/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserActivityInterceptor } from '@/shared/interceptors/userActivity.interceptor';

async function bootstrap() {
    const application = await NestFactory.create(AppModule);

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

    await application.listen(4000);
}

function enableSwagger(application: INestApplication, path: string) {
    const document = SwaggerModule.createDocument(application, swaggerConfig);
    const options = new SwaggerOptions();
    options.setDarkTheme();

    SwaggerModule.setup(path, application, document, options);
}

bootstrap();
