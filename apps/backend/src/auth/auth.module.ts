import { AuthController } from '@/auth/auth.controller';
import { JwtStrategy } from '@/shared/jwt/jwt.strategy';
import { UsersModule } from '@/users/users.module';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                privateKey: configService.getOrThrow('JWT_PRIVATE_KEY'),
                publicKey: configService.getOrThrow('JWT_PUBLIC_KEY'),
            }),
        }),
        UsersModule,
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthModule],
})
export class AuthModule {}
