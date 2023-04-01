import { CoursesService } from '@/courses/courses.service';
import { UserEntity } from '@/users/user.entity';
import {
    ExecutionContext,
    CanActivate,
    Injectable,
    Inject,
    NotFoundException,
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

    private async validate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const user = request.user as UserEntity;
        const { cid: courseId } = request.params;

        if (!this.coursesService.userHasAccessToCourse(user, courseId)) {
            throw new NotFoundException('Course not found');
        }
        return true;
    }
}
