import { AvailabilityModule } from '@/availability/availability.module';
import { RelationEntity } from '@/cards/entities/relation.entity';
import { CardsController } from '@/cards/cards.controller';
import { CardEntity } from '@/cards/entities/card.entity';
import { CardsService } from '@/cards/cards.service';
import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '@/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseAccessGuard } from '@/shared/guards/courseAccess.guard';
import { CoursesModule } from '@/courses/courses.module';

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
    providers: [CardsService, CourseAccessGuard],
    controllers: [CardsController],
    exports: [dynamicTypeOrmModule, CardsService],
})
export class CardsModule {}
