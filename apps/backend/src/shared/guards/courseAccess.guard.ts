import { CoursesService } from '@/courses/courses.service';
import { UserEntity } from '@/users/user.entity';
import {
    ForbiddenException,
    NotFoundException,
    ExecutionContext,
    CanActivate,
    Injectable,
    Inject,
} from '@nestjs/common';

@Injectable()
export class CourseAccessGuard implements CanActivate {
    constructor(
        @Inject(CoursesService)
        private readonly coursesService: CoursesService,
    ) {}

    public canActivate(context: ExecutionContext): Promise<boolean> {
        return this.validate(context);
    }

    private validate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const user = request.user as UserEntity;
        const courseId = Number(request.params.courseId);

        return this.checkUserAccess(user, courseId);
    }

    private async checkUserAccess(
        user: UserEntity,
        courseId: number,
    ): Promise<boolean> {
        const courseExists = await this.coursesService.courseExists(courseId);
        if (!courseExists) {
            throw new NotFoundException('Course not found');
        }

        const userHasAccess = this.coursesService.userHasAccessToCourse(
            user,
            courseId,
        );
        if (!userHasAccess) {
            throw new ForbiddenException('Access to this course is denied');
        }

        return true;
    }
}
