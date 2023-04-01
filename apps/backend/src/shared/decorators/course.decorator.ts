import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CourseEntity } from '@/courses/course.entity';

export const Course = createParamDecorator(
    (data, context: ExecutionContext): CourseEntity => {
        const request = context.switchToHttp().getRequest();
        return request.course;
    },
);
