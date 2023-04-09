import { AvailabilityModule } from '@/availability/availability.module';
import { BranchesModule } from '@/branches/branches.module';
import { UsersController } from '@/users/users.controller';
import { CoursesModule } from '@/courses/courses.module';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { UsersService } from '@/users/users.service';
import { forwardRef, Module } from '@nestjs/common';
import { PostsModule } from '@/posts/posts.module';
import { UserEntity } from '@/users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

const dynamicTypeOrmModule = TypeOrmModule.forFeature([UserEntity]);

@Module({
    imports: [
        dynamicTypeOrmModule,
        forwardRef(() => PostsModule),
        forwardRef(() => BranchesModule),
        forwardRef(() => AvailabilityModule),
        forwardRef(() => CoursesModule),
    ],
    controllers: [UsersController],
    providers: [UsersService, JwtAuthGuard],
    exports: [dynamicTypeOrmModule, UsersService],
})
export class UsersModule {}
