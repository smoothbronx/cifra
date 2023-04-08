import { InvalidJwtExceptionSchema } from '@/swagger/schemas/invalidJwtException.schema';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { CourseAccessGuard } from '@/shared/guards/courseAccess.guard';
import { AcceptRoles } from '@/shared/access/acceptRoles.decorator';
import { AuthUser } from '@/shared/decorators/authUser.decorator';
import { CoursesService } from '@/courses/courses.service';
import { CourseEntity } from '@/courses/course.entity';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { CourseDto } from '@/courses/dto/course.dto';
import { UserEntity } from '@/users/user.entity';
import { Role } from '@/shared/enums/Role.enum';
import {
    ApiUnauthorizedResponse,
    ApiNoContentResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiBearerAuth,
    ApiHeader,
    ApiTags,
} from '@nestjs/swagger';
import {
    BadRequestException,
    ForbiddenException,
    ConflictException,
    NotFoundException,
    ParseIntPipe,
    Controller,
    UseGuards,
    HttpCode,
    Delete,
    Param,
    Patch,
    Body,
    Post,
    Get,
} from '@nestjs/common';

@ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token',
    required: true,
})
@ApiBearerAuth('AccessTokenAuth')
@ApiUnauthorizedResponse({
    description: 'Invalid access token',
    type: InvalidJwtExceptionSchema,
})
@ApiTags('courses')
@AcceptRoles()
@UseGuards(JwtAuthGuard, CourseAccessGuard)
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    @ApiOkResponse({
        description: 'Return course',
        type: CourseDto,
    })
    @ApiException(() => new BadRequestException('Course not found'), {
        description: 'The course was not found',
    })
    @ApiException(
        () => new ForbiddenException('Access to this course is denied'),
        {
            description: 'This course is not available to the current user',
        },
    )
    @Get('/:courseId/')
    public getCourse(
        @AuthUser() user: UserEntity,
        @Param('courseId', ParseIntPipe) courseId: number,
    ) {
        return this.coursesService.getCourse(user, courseId);
    }

    @ApiOkResponse({
        description: 'Return all courses or empty array',
        type: CourseDto,
        isArray: true,
    })
    @ApiException(
        () =>
            new ForbiddenException(
                'Insufficient permissions to perform this operation',
            ),
        { description: 'The operation is not available to the user' },
    )
    @AcceptRoles(Role.ADMIN, Role.EDITOR)
    @Get('/')
    public getCourses(): Promise<CourseEntity[]> {
        return this.coursesService.getCourses();
    }

    @ApiCreatedResponse({
        description: 'Course successfully created',
        type: CourseDto,
    })
    @ApiException(() => new ConflictException('Course exists'), {
        description: 'Course already exists',
    })
    @ApiException(
        () =>
            new ForbiddenException(
                'Insufficient permissions to perform this operation',
            ),
        { description: 'The operation is not available to the user' },
    )
    @AcceptRoles(Role.ADMIN)
    @HttpCode(201)
    @Post('/')
    public createCourse(@Body() courseDto: CourseDto): Promise<CourseEntity> {
        return this.coursesService.createCourse(courseDto);
    }

    @ApiNoContentResponse({
        description: 'Course successfully deleted',
    })
    @ApiException(
        () =>
            new ForbiddenException(
                'Insufficient permissions to perform this operation',
            ),
        { description: 'The operation is not available to the user' },
    )
    @ApiException(() => new NotFoundException('Course not found'))
    @AcceptRoles(Role.ADMIN)
    @HttpCode(204)
    @Delete('/:courseId/')
    public deleteCourse(@Param('courseId', ParseIntPipe) courseId: number) {
        return this.coursesService.deleteCourse(courseId);
    }

    @ApiNoContentResponse({ description: 'Course update was successful' })
    @ApiException(
        () => new NotFoundException('Course with this id not found'),
        {
            description: 'Course was not found',
        },
    )
    @ApiException(
        () =>
            new ForbiddenException(
                'Insufficient permissions to perform this operation',
            ),
        { description: 'The operation is not available to the user' },
    )
    @ApiException(() => new ConflictException('Course with this name exists'), {
        description: 'New course name will cause a conflict',
    })
    @AcceptRoles(Role.ADMIN)
    @HttpCode(204)
    @Patch('/:courseId/')
    public updateCourse(
        @Param('courseId', ParseIntPipe) courseId: number,
        @Body() courseDto: CourseDto,
    ): Promise<void> {
        return this.coursesService.updateCourse(courseId, courseDto);
    }
}
