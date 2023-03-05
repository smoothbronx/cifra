import { InvalidJwtExceptionSchema } from '@/swagger/schemas/invalidJwtException.schema';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { AuthUser } from '@/shared/decorators/authUser.decorator';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { UsersService } from '@/users/users.service';
import { FilterDto } from '@/users/dto/filter.dto';
import { UserEntity } from '@/users/user.entity';
import { UserDto } from '@/users/dto/user.dto';
import {
    ApiUnauthorizedResponse,
    ApiNoContentResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiHeader,
    ApiTags,
} from '@nestjs/swagger';
import {
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
@Controller('users')
@UseGuards(JwtAuthGuard)
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

    @ApiOkResponse({
        description: 'Returns user',
        type: UserDto,
    })
    @ApiException(() => new NotFoundException('User not found'), {
        description: 'The user was not found',
    })
    @Get('/:id/')
    public async getUser(
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
    public async getUsers() {
        return this.userService.getUsers();
    }

    @ApiOkResponse({
        description: 'Returns filtered users',
        type: UserDto,
        isArray: true,
    })
    @Post('/')
    public async getFilteredUsers(
        @Body() filterDto: FilterDto,
    ): Promise<UserEntity[]> {
        return this.userService.getFilteredUsers(filterDto);
    }

    @HttpCode(204)
    @Patch('/:id/')
    @ApiNoContentResponse({ description: 'The user update was successful' })
    @ApiException(() => new NotFoundException('User not found'), {
        description: 'The user being update was not found',
    })
    public async updateUser(
        @Param('id', ParseIntPipe) userId: number,
        userDto: UserDto,
    ): Promise<void> {
        await this.userService.updateUser(userId, userDto);
    }

    @HttpCode(204)
    @Delete('/:id/')
    @ApiNoContentResponse({ description: 'The user deletion was successful' })
    @ApiException(() => new NotFoundException('User not found'), {
        description: 'The user being deleted was not found',
    })
    public async deleteUser(
        @Param('id', ParseIntPipe) userId: number,
    ): Promise<void> {
        await this.userService.deleteUser(userId);
    }
}
