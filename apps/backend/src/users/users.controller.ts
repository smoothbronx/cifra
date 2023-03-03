import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { UsersService } from '@/users/users.service';
import { FilterDto } from '@/users/dto/filter.dto';
import { UserEntity } from '@/users/user.entity';
import { UserDto } from '@/users/dto/user.dto';
import {
    ApiHeader,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
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
import { InvalidJwtExceptionSchema } from '@/swagger/schemas/invalidJwtException.schema';

@ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token',
    required: true,
})
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
        description: 'Returns user',
        type: UserDto,
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
    public async updateUser(
        @Param('id', ParseIntPipe) userId: number,
        userDto: UserDto,
    ): Promise<void> {
        await this.userService.updateUser(userId, userDto);
    }

    @HttpCode(204)
    @Delete('/:id/')
    public async deleteUser(
        @Param('id', ParseIntPipe) userId: number,
    ): Promise<void> {
        await this.userService.deleteUser(userId);
    }
}
