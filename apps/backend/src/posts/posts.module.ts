import { forwardRef, Module, UseGuards } from '@nestjs/common';
import { PostsController } from '@/posts/posts.controller';
import { JwtStrategy } from '@/shared/jwt/jwt.strategy';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { PostsService } from '@/posts/posts.service';
import { UsersModule } from '@/users/users.module';
import { PostEntity } from '@/posts/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

const dynamicTypeOrmModule = TypeOrmModule.forFeature([PostEntity]);

@UseGuards(JwtAuthGuard)
@Module({
    imports: [dynamicTypeOrmModule, forwardRef(() => UsersModule)],
    providers: [PostsService, JwtStrategy],
    controllers: [PostsController],
    exports: [dynamicTypeOrmModule, PostsService],
})
export class PostsModule {}
