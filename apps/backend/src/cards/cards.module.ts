import { AvailabilityModule } from '@/availability/availability.module';
import { CourseAccessGuard } from '@/shared/guards/courseAccess.guard';
import { RelationEntity } from '@/cards/entities/relation.entity';
import { CardsController } from '@/cards/cards.controller';
import { CardEntity } from '@/cards/entities/card.entity';
import { CoursesModule } from '@/courses/courses.module';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { CardsService } from '@/cards/cards.service';
import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '@/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

const dynamicTypeOrmModule = TypeOrmModule.forFeature([
    CardEntity,
    RelationEntity,
]);

@Module({
    imports: [
        dynamicTypeOrmModule,
        forwardRef(() => AvailabilityModule),
        forwardRef(() => UsersModule),
        forwardRef(() => CoursesModule),
    ],
    providers: [CardsService, CourseAccessGuard, JwtAuthGuard],
    controllers: [CardsController],
    exports: [dynamicTypeOrmModule, CardsService],
})
export class CardsModule {}
