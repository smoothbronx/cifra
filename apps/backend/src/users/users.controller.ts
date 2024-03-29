import { InvalidJwtExceptionSchema } from '@/swagger/schemas/invalidJwtException.schema';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { AcceptRoles } from '@/shared/access/acceptRoles.decorator';
import { AuthUser } from '@/shared/decorators/authUser.decorator';
import { UserCreatingDto, UserDto } from '@/users/dto/user.dto';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { UsersService } from '@/users/users.service';
import { FilterDto } from '@/users/dto/filter.dto';
import { UserEntity } from '@/users/user.entity';
import { Role } from '@/shared/enums/Role.enum';
import {
    ApiUnauthorizedResponse,
    ApiNoContentResponse,
    ApiCreatedResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiHeader,
    ApiBody,
    ApiTags,
} from '@nestjs/swagger';
import {
    MethodNotAllowedException,
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
@ApiTags('users')
@AcceptRoles()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @ApiOkResponse({
        description: 'Return current user (user in validated jwt token)',
        type: UserDto,
    })
    @Get('/user/')
    public async getCurrentUser(
        @AuthUser() user: UserEntity,
    ): Promise<UserEntity> {
        return user;
    }

    @ApiCreatedResponse({
        description: 'User successfully created',
        type: UserDto,
    })
    @ApiException(() => new ConflictException('User already exists'), {
        description: 'User exists in our service by email',
    })
    @ApiException(() => new BadRequestException('Post not found'), {
        description: 'Branch not found by code and name',
    })
    @ApiException(() => new BadRequestException('Branch not found'), {
        description: 'Post not found by code and name',
    })
    @ApiException(() => new BadRequestException('Invalid name format'), {
        description: 'Invalid name format',
    })
    @ApiException(
        () =>
            new ForbiddenException(
                'Insufficient permissions to perform this operation',
            ),
        { description: 'The operation is not available to the user' },
    )
    @AcceptRoles(Role.ADMIN, Role.EDITOR)
    @HttpCode(201)
    @Post('/')
    public async createUser(
        @AuthUser() user: UserEntity,
        @Body() credentialsDto: UserCreatingDto,
    ): Promise<UserEntity> {
        return this.userService.createUser(user, credentialsDto);
    }

    @ApiOkResponse({
        description: 'Returns user',
        type: UserDto,
    })
    @ApiException(() => new NotFoundException('User not found'), {
        description: 'The user was not found',
    })
    @Get('/:id/')
    public getUser(
        @Param('id', ParseIntPipe) userId: number,
    ): Promise<UserEntity> {
        return this.userService.getUser(userId);
    }

    @ApiOkResponse({
        description: 'Returns users',
        type: UserDto,
        isArray: true,
    })
    @Get('/')
    public getUsers() {
        return this.userService.getUsers();
    }

    @ApiOkResponse({
        description: 'Returns filtered users',
        type: UserDto,
        isArray: true,
    })
    @ApiBody({
        description: 'Filter',
        type: FilterDto,
        required: true,
    })
    @Post('/filter/')
    public getFilteredUsers(
        @Body() filterDto: FilterDto,
    ): Promise<UserEntity[]> {
        return this.userService.getFilteredUsers(filterDto);
    }

    @ApiNoContentResponse({ description: 'The user update was successful' })
    @ApiException(() => new NotFoundException('User not found'), {
        description: 'The user being update was not found',
    })
    @ApiException(
        () =>
            new ForbiddenException(
                'Insufficient permissions to perform this operation',
            ),
        { description: 'The operation is not available to the user' },
    )
    @AcceptRoles(Role.ADMIN)
    @HttpCode(204)
    @Patch('/:id/')
    public async updateUser(
        @Param('id', ParseIntPipe) userId: number,
        @Body() userDto: UserDto,
    ): Promise<void> {
        await this.userService.updateUser(userId, userDto);
    }

    @ApiNoContentResponse({ description: 'The user deletion was successful' })
    @ApiException(() => new NotFoundException('User not found'), {
        description: 'The user being deleted was not found',
    })
    @ApiException(
        () => new MethodNotAllowedException('User cannot delete himself'),
        {
            description: 'The user cannot delete himself.',
        },
    )
    @ApiException(
        () =>
            new ForbiddenException(
                'Insufficient permissions to perform this operation',
            ),
        { description: 'The operation is not available to the user' },
    )
    @AcceptRoles(Role.ADMIN)
    @HttpCode(204)
    @Delete('/:id/')
    public async deleteUser(
        @AuthUser() initiator: UserEntity,
        @Param('id', ParseIntPipe) userId: number,
    ): Promise<void> {
        await this.userService.deleteUser(initiator, userId);
    }
}
