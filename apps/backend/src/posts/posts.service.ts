import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '@/posts/post.entity';
import { PostDto } from '@/posts/post.dto';
import { Repository } from 'typeorm';
import {
    ConflictException,
    NotFoundException,
    Injectable,
} from '@nestjs/common';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(PostEntity)
        private readonly postsRepository: Repository<PostEntity>,
    ) {}

    public getPosts(): Promise<PostEntity[]> {
        return this.postsRepository.find();
    }

    public getPost(postId: number): Promise<PostEntity> {
        return this.getPostByIdOrFall(postId);
    }

    public async createPost(postDto: PostDto): Promise<void> {
        const post = await this.postsRepository.findOneBy({
            name: postDto.name,
        });
        if (post) throw new ConflictException('Post exists');

        const newPost = this.postsRepository.create(postDto);
        await this.postsRepository.save(newPost);
    }

    public async deletePost(postId: number): Promise<void> {
        await this.getPostByIdOrFall(postId);
        await this.postsRepository.delete(postId);
    }

    public async updatePost(postId: number, postDto: PostDto): Promise<void> {
        await this.getPostByIdOrFall(postId);
        await this.postsRepository.update({ id: postId }, postDto);
    }

    private async getPostByIdOrFall(id: number): Promise<PostEntity> {
        const post = await this.postsRepository.findOneBy({ id });
        if (!post) throw new NotFoundException('Post not found');
        return post;
    }
}
