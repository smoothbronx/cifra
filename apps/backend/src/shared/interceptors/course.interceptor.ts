import { CoursesService } from '@/courses/courses.service';
import { Observable } from 'rxjs';
import {
    ExecutionContext,
    NestInterceptor,
    CallHandler,
    Injectable,
    Inject,
} from '@nestjs/common';

@Injectable()
export class CourseInterceptor implements NestInterceptor {
    constructor(
        @Inject(CoursesService)
        private readonly coursesService: CoursesService,
    ) {}

    public async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        await this.setCourseToRequest(request);

        return next.handle();
    }

    public async setCourseToRequest(request: any): Promise<void> {
        const user = request.user;
        const { courseId } = request.params;

        request.course = this.coursesService.getCourse(user, courseId);
    }
}
