import { AvailabilityEntity } from '@/availability/availability.entity';
import { AvailabilityModule } from '@/availability/availability.module';
import { RelationEntity } from '@/cards/entities/relation.entity';
import { BranchesService } from '@/branches/branches.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BranchesModule } from '@/branches/branches.module';
import { CardEntity } from '@/cards/entities/card.entity';
import { CoursesModule } from '@/courses/courses.module';
import { BranchEntity } from '@/branches/branch.entity';
import { CourseEntity } from '@/courses/course.entity';
import { StaticModule } from '@/static/static.module';
import { UsersService } from '@/users/users.service';
import { PostsService } from '@/posts/posts.service';
import { CardsModule } from '@/cards/cards.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from '@/posts/posts.module';
import { PostEntity } from '@/posts/post.entity';
import { UserEntity } from '@/users/user.entity';
import { Inject, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import * as Joi from 'joi';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: join(__dirname, '../../../', '.env'),
            validationSchema: Joi.object({
                JWT_PRIVATE_KEY: Joi.string(),
                JWT_PUBLIC_KEY: Joi.string(),
                POSTGRES_HOST: Joi.string(),
                POSTGRES_PORT: Joi.number(),
                POSTGRES_USERNAME: Joi.string(),
                POSTGRES_PASSWORD: Joi.string(),
                POSTGRES_DATABASE: Joi.string(),
            }),
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.getOrThrow('POSTGRES_HOST'),
                port: configService.getOrThrow<number>('POSTGRES_PORT'),
                username: configService.getOrThrow('POSTGRES_USERNAME'),
                password: configService.getOrThrow('POSTGRES_PASSWORD'),
                database: configService.getOrThrow('POSTGRES_DATABASE'),
                extra: {
                    ssl: false,
                },
                ssl: {
                    rejectUnauthorized: false,
                },
                entities: [
                    AvailabilityEntity,
                    RelationEntity,
                    CourseEntity,
                    BranchEntity,
                    UserEntity,
                    PostEntity,
                    CardEntity,
                ],
                autoLoadEntities: true,
                synchronize: true,
            }),
        }),
        AvailabilityModule,
        BranchesModule,
        CoursesModule,
        StaticModule,
        CardsModule,
        PostsModule,
        UsersModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    constructor(
        @Inject(UsersService)
        private readonly usersService: UsersService,
        @Inject(BranchesService)
        private readonly branchesService: BranchesService,
        @Inject(PostsService)
        private readonly postsService: PostsService,
    ) {
        branchesService
            .insertBranches(
                'Нижний новгород',
                'Саратов',
                'Иркутск',
                'Владивосток',
                'Улан-Удэ',
                'Севастополь',
                'Мурманск',
                'Калининград',
            )
            .then(() => {
                postsService
                    .insertPosts(
                        'Администратор',
                        'Старший преподаватель',
                        'Младший преподаватель',
                        'Ученик',
                    )
                    .then(() => {
                        usersService.createAdmin();
                        usersService.createEditor();
                    });
            });
    }
}
