import { CoursesController } from '@/courses/courses.controller';
import { CoursesService } from '@/courses/courses.service';
import { CourseEntity } from '@/courses/course.entity';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

const dynamicTypeOrmModule = TypeOrmModule.forFeature([CourseEntity]);

@Module({
    imports: [dynamicTypeOrmModule],
    controllers: [CoursesController],
    providers: [CoursesService, JwtAuthGuard],
    exports: [dynamicTypeOrmModule, CoursesService],
})
export class CoursesModule {}
