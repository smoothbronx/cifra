import { PostsService } from '@/posts/posts.service';
import { PostEntity } from '@/posts/post.entity';
import { PostDto } from '@/posts/post.dto';
import {
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

@Controller('/posts/')
export class PostsController {
    constructor(
        @Inject(PostsService)
        private readonly postsService: PostsService,
    ) {}

    @Get()
    public getPosts(): Promise<PostEntity[]> {
        return this.postsService.getPosts();
    }

    @Get('/:id/')
    public getPost(
        @Param('id', ParseIntPipe) postId: number,
    ): Promise<PostEntity> {
        return this.postsService.getPost(postId);
    }

    @Post()
    @HttpCode(201)
    public createPost(@Body() postDto: PostDto): Promise<void> {
        return this.postsService.createPost(postDto);
    }

    @Delete('/:id/')
    @HttpCode(204)
    public deletePost(
        @Param('id', ParseIntPipe) postId: number,
    ): Promise<void> {
        return this.postsService.deletePost(postId);
    }

    @Patch('/:id/')
    @HttpCode(204)
    public updatePost(
        @Param('id', ParseIntPipe) postId: number,
        @Body() postDto: PostDto,
    ): Promise<void> {
        return this.postsService.updatePost(postId, postDto);
    }
}
