import { AvailabilityService } from '@/availability/availability.service';
import { AvailabilityEntity } from '@/availability/availability.entity';
import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '@/users/users.module';
import { CardsModule } from '@/cards/cards.module';
import { TypeOrmModule } from '@nestjs/typeorm';

const dynamicTypeOrmModule = TypeOrmModule.forFeature([AvailabilityEntity]);

@Module({
    imports: [
        dynamicTypeOrmModule,
        forwardRef(() => UsersModule),
        forwardRef(() => CardsModule),
    ],
    providers: [AvailabilityService],
    exports: [dynamicTypeOrmModule, AvailabilityService],
})
export class AvailabilityModule {}
