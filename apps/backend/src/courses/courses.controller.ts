import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AcceptRoles } from '@/shared/access/acceptRoles.decorator';
import { Role } from '@/shared/enums/Role.enum';
import { AuthUser } from '@/shared/decorators/authUser.decorator';
import { UserEntity } from '@/users/user.entity';
import { CourseEntity } from '@/courses/course.entity';
import { CoursesService } from '@/courses/courses.service';
import { CourseDto } from '@/courses/dto/course.dto';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiHeader,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { InvalidJwtExceptionSchema } from '@/swagger/schemas/invalidJwtException.schema';
import { RelationDto } from '@/cards/dto/relation.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

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
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    @ApiOkResponse({
        description: 'Return course',
        type: RelationDto,
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
    @Get('/:id/')
    public getCourse(
        @AuthUser() user: UserEntity,
        @Param('id', ParseIntPipe) courseId: number,
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
        type: RelationDto,
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
    @Delete('/:id/')
    public deleteCourse(@Param('id', ParseIntPipe) courseId: number) {
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
    @Patch('/:id/')
    public updateCourse(
        @Param('id', ParseIntPipe) courseId: number,
        @Body() courseDto: CourseDto,
    ): Promise<void> {
        return this.coursesService.updateCourse(courseId, courseDto);
    }
}
