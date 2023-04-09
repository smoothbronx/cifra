import { CryptoService } from '@/shared/crypto/crypto.service';
import { StaticController } from '@/static/static.controller';
import { StaticService } from '@/static/static.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [StaticController],
    providers: [StaticService, CryptoService],
    exports: [StaticService],
})
export class StaticModule {}
