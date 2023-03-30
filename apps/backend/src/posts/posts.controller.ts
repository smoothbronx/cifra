import { InvalidJwtExceptionSchema } from '@/swagger/schemas/invalidJwtException.schema';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { AcceptRoles } from '@/shared/access/acceptRoles.decorator';
import { PostsService } from '@/posts/posts.service';
import { PostEntity } from '@/posts/post.entity';
import { Role } from '@/shared/enums/Role.enum';
import { PostDto } from '@/posts/post.dto';
import {
    NotFoundException,
    ConflictException,
    ParseIntPipe,
    Controller,
    HttpCode,
    Delete,
    Inject,
    Param,
    Patch,
    Body,
    Post,
    Get,
} from '@nestjs/common';
import {
    ApiUnauthorizedResponse,
    ApiNoContentResponse,
    ApiCreatedResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiHeader,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('posts')
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
@Controller('/posts/')
export class PostsController {
    constructor(
        @Inject(PostsService)
        private readonly postsService: PostsService,
    ) {}

    @ApiOkResponse({
        description: 'Return the all posts',
        type: PostDto,
        isArray: true,
    })
    @Get()
    public getPosts(): Promise<PostEntity[]> {
        return this.postsService.getPosts();
    }

    @ApiOkResponse({
        description: 'Return the post by his id',
        type: PostDto,
    })
    @ApiException(() => new NotFoundException('Post not found'))
    @Get('/:id/')
    public getPost(
        @Param('id', ParseIntPipe) postId: number,
    ): Promise<PostEntity> {
        return this.postsService.getPost(postId);
    }

    @ApiCreatedResponse({
        description: 'The post creating was successful',
    })
    @ApiException(() => new ConflictException('Post with current name exists'))
    @AcceptRoles(Role.ADMIN)
    @Post()
    @HttpCode(201)
    public createPost(@Body() postDto: PostDto): Promise<void> {
        return this.postsService.createPost(postDto);
    }

    @ApiNoContentResponse({
        description: 'The post deletion was successful',
    })
    @ApiException(() => new NotFoundException('Post not found'), {
        description: 'Post not found',
    })
    @AcceptRoles(Role.ADMIN)
    @Delete('/:id/')
    @HttpCode(204)
    public deletePost(
        @Param('id', ParseIntPipe) postId: number,
    ): Promise<void> {
        return this.postsService.deletePost(postId);
    }

    @ApiNoContentResponse({
        description: 'The post update was successful',
    })
    @ApiException(() => new NotFoundException('Post not found'), {
        description: 'Post not found',
    })
    @ApiException(() => new ConflictException('Post exists'), {
        description: 'Another post with current name exists',
    })
    @AcceptRoles(Role.ADMIN)
    @Patch('/:id/')
    @HttpCode(204)
    public updatePost(
        @Param('id', ParseIntPipe) postId: number,
        @Body() postDto: PostDto,
    ): Promise<void> {
        return this.postsService.updatePost(postId, postDto);
    }
}
