import { CourseEntity } from '@/courses/course.entity';
import { CourseDto } from '@/courses/dto/course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@/users/user.entity';
import { Role } from '@/shared/enums/Role.enum';
import { Repository } from 'typeorm';
import {
    ConflictException,
    NotFoundException,
    Injectable,
} from '@nestjs/common';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(CourseEntity)
        private readonly coursesRepository: Repository<CourseEntity>,
    ) {}

    public getCourses(): Promise<CourseEntity[]> {
        return this.coursesRepository.find();
    }

    public async getCourse(user: UserEntity, courseId: number) {
        if ([Role.ADMIN, Role.EDITOR].includes(user.role)) {
            const course = await this.coursesRepository.findOneBy({
                id: courseId,
            });

            if (!course) {
                throw new NotFoundException('Course is not found');
            }

            return course;
        }
        return user.course;
    }

    public userHasAccessToCourse(user: UserEntity, courseId: number): boolean {
        if ([Role.ADMIN, Role.EDITOR].includes(user.role)) {
            return true;
        }

        return user.course?.id === courseId;
    }

    public async courseExists(courseId: number): Promise<boolean> {
        return this.coursesRepository.exist({ where: { id: courseId } });
    }

    public async deleteCourse(courseId: number) {
        const courseExists = await this.coursesRepository.exist({
            where: { id: courseId },
        });

        if (!courseExists) {
            throw new NotFoundException('Course not found');
        }

        await this.coursesRepository.delete({ id: courseId });
    }

    public async createCourse(courseDto: CourseDto): Promise<CourseEntity> {
        const courseExists = await this.coursesRepository.exist({
            where: { name: courseDto.name },
        });

        if (courseExists) {
            throw new ConflictException('Course exists');
        }

        const course = this.coursesRepository.create(courseDto);
        return this.coursesRepository.save(course);
    }

    public async updateCourse(
        courseId: number,
        courseDto: CourseDto,
    ): Promise<void> {
        const course = await this.coursesRepository.findOneBy({ id: courseId });

        if (!course) {
            throw new NotFoundException('Course with this id not found');
        }

        const courseWithThisNameExists = await this.coursesRepository.exist({
            where: { name: courseDto.name },
        });

        if (courseWithThisNameExists) {
            throw new ConflictException('Course with this name exists');
        }

        course.name = courseDto.name;
        await this.coursesRepository.save(course);
    }
}
