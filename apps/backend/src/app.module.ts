import { ConfigModule, ConfigService } from '@nestjs/config';
import { BranchesModule } from '@/branches/branches.module';
import { BranchEntity } from '@/branches/branch.entity';
import { UsersService } from '@/users/users.service';
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
                entities: [UserEntity, PostEntity, BranchEntity],
                autoLoadEntities: true,
                synchronize: true,
            }),
        }),
        BranchesModule,
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
    ) {
        usersService.createAdmin();
        usersService.createModerator();
    }
}
