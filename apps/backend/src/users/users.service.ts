import { AvailabilityService } from '@/availability/availability.service';
import { DropdownItemDto, FilterDto } from '@/users/dto/filter.dto';
import { UserCreatingDto, UserDto } from '@/users/dto/user.dto';
import { CryptoService } from '@/shared/crypto/crypto.service';
import { Any, FindOptionsWhere, Repository } from 'typeorm';
import { BranchEntity } from '@/branches/branch.entity';
import { CourseEntity } from '@/courses/course.entity';
import { NameSegments } from '@/@types/NameSegments';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@/users/user.entity';
import { PostEntity } from '@/posts/post.entity';
import { Role } from '@/shared/enums/Role.enum';
import { ConfigService } from '@nestjs/config';
import {
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    Logger,
    MethodNotAllowedException,
    NotFoundException,
} from '@nestjs/common';

@Injectable()
export class UsersService {
    private readonly cryptoService = CryptoService;
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @Inject(ConfigService)
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => AvailabilityService))
        private readonly availabilityService: AvailabilityService,
        @InjectRepository(UserEntity)
        private readonly usersRepository: Repository<UserEntity>,
        @InjectRepository(PostEntity)
        private readonly postsRepository: Repository<PostEntity>,
        @InjectRepository(BranchEntity)
        private readonly branchesRepository: Repository<BranchEntity>,
        @InjectRepository(CourseEntity)
        private readonly coursesRepository: Repository<CourseEntity>,
    ) {}

    public async createAdmin(): Promise<void> {
        const email = this.configService.getOrThrow('ADMIN_LOGIN');
        const password = this.configService.getOrThrow('ADMIN_PASSWORD');

        const adminExists = await this.usersRepository.exist({
            where: { email, role: Role.ADMIN },
        });

        if (adminExists) {
            this.logger.debug(`Admin with email<${email}> already exists`);
            this.logger.log('Admin initializing skipped');
            return;
        }

        const posts = await this.postsRepository.find();
        const branches = await this.branchesRepository.find();

        const admin = this.usersRepository.create({
            email,
            firstName: 'Иван',
            lastName: 'Иванов',
            patronymic: 'Иванович',
            phone: '+79673515210',
            password: this.cryptoService.generateHashFromPassword(password),
            role: Role.ADMIN,
            branch: branches.at(2),
            post: posts.at(2),
        });

        await this.usersRepository.save(admin);
        this.logger.log('Admin initializing complete');
    }

    public async createEditor(): Promise<void> {
        const email = this.configService.getOrThrow('EDITOR_LOGIN');
        const password = this.configService.getOrThrow('EDITOR_PASSWORD');

        const editorExists = await this.usersRepository.exist({
            where: { email, role: Role.EDITOR },
        });
        if (editorExists) {
            this.logger.debug(`Editor with email<${email}> already exists`);
            this.logger.log('Editor initializing skipped');
            return;
        }

        const posts = await this.postsRepository.find();
        const branches = await this.branchesRepository.find();

        const editor = this.usersRepository.create({
            email,
            password: this.cryptoService.generateHashFromPassword(password),
            role: Role.EDITOR,
            firstName: 'Петр',
            lastName: 'Петров',
            phone: '+79673515210',
            branch: branches.at(0),
            post: posts.at(0),
        });

        await editor.save();
        this.logger.log('Editor initializing complete');
    }

    public saveUser(user: UserEntity): Promise<UserEntity> {
        return this.usersRepository.save(user);
    }

    // TODO: Возможность оставлять поле course пустым
    public async createUser(
        initiator: UserEntity,
        credentials: UserCreatingDto,
    ): Promise<UserEntity> {
        const errorReasons = {
            branch: {
                notFound: 'Branch not found',
                // TODO: Перенести в валидатор DTO
                mustBeDefined: 'Branch must be defined',
            },
            course: {
                notFound: 'Course not found',
                // TODO: Перенести в валидатор DTO
                mustBeDefined: 'Course must be defined',
            },
            user: {
                conflict: 'User already exists',
            },
        };

        this.validatePayload(initiator, credentials);

        const userExists = await this.usersRepository.exist({
            where: { email: credentials.email },
        });

        if (userExists) {
            throw new ConflictException(errorReasons.user.conflict);
        }

        credentials.password = this.cryptoService.generateHashFromPassword(
            credentials.password,
        );

        let post: PostEntity | undefined;
        if (credentials.post) {
            post = await this.getOrThrowBadRequest(
                credentials.post,
                this.postsRepository,
                'Post not found',
            );
        } else post = credentials.post;

        const nameSegments = this.splitFullname(credentials.fullname);

        const user = await this.usersRepository.create({
            ...credentials,
            ...nameSegments,
            post,
        });

        if ([Role.USER, Role.HEAD].includes(credentials.role)) {
            if (!credentials.branch)
                this.creatingErrorWithReason(errorReasons.branch.mustBeDefined);

            const branch = await this.branchesRepository.findOneBy(
                credentials.branch,
            );

            if (!branch)
                this.creatingErrorWithReason(errorReasons.branch.notFound);

            user.branch = branch;
        }

        if (credentials.role === Role.USER) {
            if (!credentials.course)
                this.creatingErrorWithReason(errorReasons.course.mustBeDefined);

            const course = await this.coursesRepository.findOneBy({
                id: credentials.course.code,
                name: credentials.course.name,
            });

            if (!course)
                this.creatingErrorWithReason(errorReasons.course.notFound);

            user.course = course;
            await user.save();
            await this.availabilityService.getInitialAvailability(course, user);
        }

        return user.save();
    }

    private creatingErrorWithReason(reason: string): never {
        this.logger.error(`Failed to create user. Reason: ${reason}`);
        throw new BadRequestException(reason);
    }

    private validatePayload(
        initiator: UserEntity,
        credentials: UserCreatingDto,
    ): void {
        if (
            (initiator.role === Role.EDITOR &&
                credentials.role !== Role.USER) ||
            credentials.role === Role.ADMIN
        ) {
            throw new BadRequestException(
                'Initiator cannot create a user with this role',
            );
        }

        if (
            [Role.HEAD, Role.EDITOR].includes(initiator.role) &&
            credentials.branch !== initiator.branch
        ) {
            throw new BadRequestException(
                'Head of the branch cannot create users of other branches',
            );
        }
    }

    private splitFullname(fullname: string): NameSegments {
        const splitName: string[] = fullname.split(' ');

        if (splitName.length < 2) {
            throw new BadRequestException('Invalid name format');
        }

        return {
            firstName: splitName[1],
            lastName: splitName[0],
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
        const tryGetCodes = (entities: DropdownItemDto[] | undefined) => {
            return entities && entities.length !== 0
                ? Any(entities.map((entity) => entity.code))
                : undefined;
        };

        const filteredUsers: UserEntity[] = await this.usersRepository.findBy({
            branch: tryGetCodes(filterDto.branches),
            post: tryGetCodes(filterDto.posts),
            course: tryGetCodes(filterDto.courses),
        });

        const nameSegments = filterDto.name?.split(' ') || [];
        if (nameSegments.length === 0) return filteredUsers;

        return filteredUsers.filter((user) =>
            nameSegments.every((segment) =>
                user.getFullName().includes(segment),
            ),
        );
    }

    public async deleteUser(
        initiator: UserEntity,
        userId: number,
    ): Promise<void> {
        if (initiator.id === userId)
            throw new MethodNotAllowedException('User cannot delete himself');

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
