import {
    ConflictException,
    NotFoundException,
    Injectable,
    Inject,
    BadRequestException,
} from '@nestjs/common';
import { CryptoService } from '@/shared/crypto/crypto.service';
import { BranchEntity } from '@/branches/branch.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from '@/users/dto/filter.dto';
import { UserEntity } from '@/users/user.entity';
import { PostEntity } from '@/posts/post.entity';
import { Role } from '@/shared/enums/Role.enum';
import { UserCreatingDto, UserDto } from '@/users/dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { Any, FindOptionsWhere, Repository } from 'typeorm';
import { NameSegments } from '@/@types/NameSegments';

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
        const email = this.configService.getOrThrow('ADMIN_LOGIN');
        const password = this.configService.getOrThrow('ADMIN_PASSWORD');

        const user = await this.usersRepository.findOneBy({
            email,
        });
        if (user) return;

        const admin = this.usersRepository.create();

        admin.email = email;
        admin.password = this.cryptoService.generateHashFromPassword(password);
        admin.role = Role.ADMIN;
        admin.firstName = 'Admin';
        admin.lastName = 'Admin';
        admin.lastEntry = new Date();

        const posts = await this.postsRepository.find();
        admin.post = posts[2];

        const branches = await this.branchesRepository.find();
        admin.branch = branches[2];

        await this.usersRepository.save(admin);
    }

    public async createModerator(): Promise<void> {
        const email = this.configService.getOrThrow('MODERATOR_LOGIN');
        const password = this.configService.getOrThrow('MODERATOR_PASSWORD');

        const user = await this.usersRepository.findOneBy({
            email,
        });
        if (user) return;

        const moderator = this.usersRepository.create();

        moderator.email = email;
        moderator.password =
            this.cryptoService.generateHashFromPassword(password);
        moderator.role = Role.EDITOR;
        moderator.firstName = 'Editor';
        moderator.lastName = 'Editor';
        moderator.lastEntry = new Date();

        const posts = await this.postsRepository.find();
        moderator.post = posts[0];

        const branches = await this.branchesRepository.find();
        moderator.branch = branches[0];

        await this.usersRepository.save(moderator);
    }

    public async createUser(
        initiator: UserEntity,
        credentials: UserCreatingDto,
    ): Promise<void> {
        console.log(credentials);
        const user = await this.usersRepository.findOneBy({
            email: credentials.email,
        });

        if (user) {
            throw new ConflictException('User already exists');
        }

        credentials.password = this.cryptoService.generateHashFromPassword(
            credentials.password,
        );

        let post: PostEntity | null;
        if (credentials.post) {
            post = await this.getOrThrowBadRequest(
                credentials.post,
                this.postsRepository,
                'Post not found',
            );
        } else post = initiator.post;

        let branch: BranchEntity;
        if (credentials.branch) {
            branch = await this.getOrThrowBadRequest(
                credentials.branch,
                this.branchesRepository,
                'Branch not found',
            );
        } else branch = initiator.post;

        const nameSegments = this.splitFullname(credentials.fullname);

        const newUser = this.usersRepository.create({
            ...credentials,
            ...nameSegments,
            post,
            branch,
        });
        await this.usersRepository.insert(newUser);
    }

    private splitFullname(fullname: string): NameSegments {
        const splitName: string[] = fullname.split(' ');

        if (splitName.length < 2) {
            throw new BadRequestException('Invalid name format');
        }

        return {
            firstName: splitName[0],
            lastName: splitName[1],
            patronymic: splitName.at(2),
        };
    }

    private async getOrThrowBadRequest<T>(
        where: FindOptionsWhere<T>,
        repository: Repository<T>,
        message: string,
    ): Promise<T> {
        try {
            return repository.findOneByOrFail(where);
        } catch {
            throw new BadRequestException(message);
        }
    }

    public async getFilteredUsers(filterDto: FilterDto): Promise<UserEntity[]> {
        const filteredUsers: UserEntity[] = await this.usersRepository.findBy({
            branch:
                filterDto.branches && filterDto.branches.length !== 0
                    ? Any(filterDto.branches.map((branch) => branch.code))
                    : undefined,
            post:
                filterDto.posts && filterDto.posts.length !== 0
                    ? Any(filterDto.posts.map((post) => post.code))
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

    public async getUserByEmailAndRefresh(
        email: string,
        refresh: string,
    ): Promise<UserEntity> {
        const user = await this.usersRepository.findOneBy({ email, refresh });
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

    public async getUserByEmail(email: string) {
        const user = await this.usersRepository.findOneBy({ email });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
}
