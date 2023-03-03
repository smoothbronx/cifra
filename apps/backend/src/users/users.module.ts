import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/users/user.entity';
import { PostEntity } from '@/posts/post.entity';
import { BranchEntity } from '@/branches/branch.entity';
import { UsersController } from '@/users/users.controller';
import { UsersService } from '@/users/users.service';
import { BranchesModule } from '@/branches/branches.module';
import { PostsModule } from '@/posts/posts.module';

const dynamicTypeOrmModule = TypeOrmModule.forFeature([
    UserEntity,
    PostEntity,
    BranchEntity,
]);

@Module({
    imports: [
        dynamicTypeOrmModule,
        forwardRef(() => PostsModule),
        forwardRef(() => BranchesModule),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [dynamicTypeOrmModule, UsersService],
})
export class UsersModule {}
