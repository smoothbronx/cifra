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

    public getPost(postCode: number): Promise<PostEntity> {
        return this.getPostByIdOrFall(postCode);
    }

    public async createPost(postDto: PostDto): Promise<void> {
        const post = await this.postsRepository.findOneBy({
            name: postDto.name,
        });
        if (post) throw new ConflictException('Post exists');

        const newPost = this.postsRepository.create(postDto);
        await this.postsRepository.save(newPost);
    }

    public async deletePost(postCode: number): Promise<void> {
        await this.getPostByIdOrFall(postCode);
        await this.postsRepository.delete(postCode);
    }

    public async updatePost(postCode: number, postDto: PostDto): Promise<void> {
        await this.getPostByIdOrFall(postCode);
        await this.postsRepository.update({ code: postCode }, postDto);
    }

    private async getPostByIdOrFall(code: number): Promise<PostEntity> {
        const post = await this.postsRepository.findOneBy({ code });
        if (!post) throw new NotFoundException('Post not found');
        return post;
    }
}
