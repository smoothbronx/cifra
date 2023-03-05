import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('Cifra')
    .setVersion('1.0')
    .addTag('users')
    .addTag('branches')
    .addTag('posts')
    .addTag('auth')
    .addBearerAuth(
        {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Access token auth',
            in: 'header',
        },
        'AccessTokenAuth',
    )
    .addBearerAuth(
        {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Refresh token auth',
            in: 'header',
        },
        'RefreshTokenAuth',
    )
    .addBasicAuth(
        {
            type: 'http',
        },
        'LoginAuth',
    )
    .build();
