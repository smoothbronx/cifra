import { CryptoService } from '@/shared/crypto/crypto.service';
import { StaticController } from '@/static/static.controller';
import { StaticService } from '@/static/static.service';
import { JwtStrategy } from '@/shared/jwt/jwt.strategy';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [UsersModule],
    controllers: [StaticController],
    providers: [StaticService, CryptoService, JwtAuthGuard, JwtStrategy],
    exports: [StaticService],
})
export class StaticModule {}
