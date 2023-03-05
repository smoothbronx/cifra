import {
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CryptoService } from '@/shared/crypto/crypto.service';
import { BranchEntity } from '@/branches/branch.entity';
import { UserEntity } from '@/users/user.entity';
import { PostEntity } from '@/posts/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from '@/users/dto/filter.dto';
import { UserDto } from '@/users/dto/user.dto';
import { Any, Repository } from 'typeorm';
import { Role } from '@/shared/enums/Role.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
    private readonly cryptoService = CryptoService;

    constructor(
        @Inject(ConfigService)
        private readonly configService: ConfigService,
        @InjectRepository(UserEntity)
        private readonly usersRepository: Repository<UserEntity>,
        @InjectRepository(PostEntity)
        private readonly postsRepository: Repository<PostEntity>,
        @InjectRepository(BranchEntity)
        private readonly branchesRepository: Repository<BranchEntity>,
    ) {}

    public async createAdmin(): Promise<void> {
        const login = this.configService.getOrThrow('ADMIN_LOGIN');
        const password = this.configService.getOrThrow('ADMIN_PASSWORD');

        const user = await this.usersRepository.findOneBy({
            login,
        });
        if (user) return;

        const admin = this.usersRepository.create();

        admin.login = login;
        admin.password = this.cryptoService.generateHashFromPassword(password);
        admin.role = Role.ADMIN;
        admin.firstName = 'Admin';
        admin.lastName = 'Admin';
        admin.lastEntry = (Date.now() / 1000) | 0;

        const posts = await this.postsRepository.find();
        admin.post = posts[2];

        const branches = await this.branchesRepository.find();
        admin.branch = branches[2];

        await this.usersRepository.save(admin);
    }

    public async createModerator(): Promise<void> {
        const login = this.configService.getOrThrow('MODERATOR_LOGIN');
        const password = this.configService.getOrThrow('MODERATOR_PASSWORD');

        const user = await this.usersRepository.findOneBy({
            login,
        });
        if (user) return;

        const moderator = this.usersRepository.create();

        moderator.login = login;
        moderator.password =
            this.cryptoService.generateHashFromPassword(password);
        moderator.role = Role.EDITOR;
        moderator.firstName = 'Editor';
        moderator.lastName = 'Editor';
        moderator.lastEntry = (Date.now() / 1000) | 0;

        const posts = await this.postsRepository.find();
        moderator.post = posts[0];

        const branches = await this.branchesRepository.find();
        moderator.branch = branches[0];

        await this.usersRepository.save(moderator);
    }

    public async createUser(userDto: UserDto): Promise<void> {
        const user = await this.usersRepository.findOneBy({
            login: userDto.login,
        });

        if (user) {
            throw new ConflictException('User already exists');
        }

        userDto.password = this.cryptoService.generateHashFromPassword(
            userDto.password,
        );

        const newUser = this.usersRepository.create(userDto);
        await this.usersRepository.insert(newUser);
    }

    public async getFilteredUsers(filterDto: FilterDto): Promise<UserEntity[]> {
        const filteredUsers: UserEntity[] = await this.usersRepository.findBy({
            branch: filterDto.branches
                ? Any(filterDto.branches.map((branch) => branch.name))
                : undefined,
            post: filterDto.posts
                ? Any(filterDto.posts.map((post) => post.name))
                : undefined,
        });

        const nameSegments = filterDto.name?.split(' ') || [];
        if (nameSegments.length === 0) return filteredUsers;
        return filteredUsers.filter((user) =>
            nameSegments.every((segment) =>
                user.getFullName().includes(segment),
            ),
        );
    }

    public async deleteUser(userId: number): Promise<void> {
        const user: UserEntity | null = await this.usersRepository.findOneBy({
            id: userId,
        });

        if (!user) {
            throw new NotFoundException();
        }

        await this.usersRepository.delete({ id: user.id });
    }

    public async getUsers(): Promise<UserEntity[]> {
        return this.usersRepository.find();
    }

    public async getUser(userId: number): Promise<UserEntity> {
        return this.getUserOrFall(userId);
    }

    public async getUserByLoginAndRefresh(
        login: string,
        refresh: string,
    ): Promise<UserEntity> {
        const user = await this.usersRepository.findOneBy({ login, refresh });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    public async updateUserRefreshToken(
        user: UserEntity,
        newRefreshToken: string,
    ): Promise<void> {
        await this.usersRepository.update(
            { id: user.id },
            { refresh: newRefreshToken },
        );
    }

    public async updateUser(userId: number, userDto: UserDto): Promise<void> {
        await this.getUserOrFall(userId);
        await this.usersRepository.update({ id: userId }, userDto);
    }

    private async getUserOrFall(userId: number): Promise<UserEntity> {
        const user: UserEntity | null = await this.usersRepository.findOneBy({
            id: userId,
        });

        if (!user) throw new NotFoundException('User not found');

        return user;
    }

    public async getUserByLogin(login: string) {
        const user = await this.usersRepository.findOneBy({ login });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
}
