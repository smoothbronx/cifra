import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CryptoService } from 'src/shared/crypto/crypto.service';
import { AuthSignInDto } from './dto/auth.signin.dto';
import { UsersService } from '@/users/users.service';
import { TokenPayload } from '@/@types/TokenPayload';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthTokens } from '@/@types/AuthTokens';
import { UserEntity } from '@/users/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    private readonly cryptoService = CryptoService;

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @Inject(JwtService)
        private readonly jwtService: JwtService,
        @Inject(UsersService)
        private readonly usersService: UsersService,
        @Inject(ConfigService)
        private readonly configService: ConfigService,
    ) {}

    public async refreshTokens(refreshToken: string): Promise<AuthTokens> {
        const token = this.jwtService.verify<TokenPayload>(refreshToken, {
            publicKey: this.configService.getOrThrow('JWT_PRIVATE_KEY'),
        });

        try {
            const user = await this.usersService.getUserByEmailAndRefresh(
                token.email,
                refreshToken,
            );
            return await this.generateNewTokensPair(user);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    public async signIn(userCredentials: AuthSignInDto): Promise<AuthTokens> {
        const user = await this.usersService.getUserByEmail(
            userCredentials.email,
        );

        if (!user) {
            throw new UnauthorizedException('Incorrect credentials');
        }

        await this.validateUserCredentialsOnSignIn(user, userCredentials);

        return this.generateNewTokensPair(user);
    }

    private async validateUserCredentialsOnSignIn(
        targetUser: UserEntity,
        userCredentials: AuthSignInDto,
    ) {
        const isMatch: boolean = this.cryptoService.passwordMatch(
            userCredentials.password,
            targetUser.password,
        );

        if (!isMatch) {
            throw new UnauthorizedException('Incorrect credentials');
        }
    }

    private async generateNewTokensPair(user: UserEntity): Promise<AuthTokens> {
        const tokens: AuthTokens = this.generateNewAuthTokensPair(user);
        await this.updateUserRefreshToken(user, tokens.refreshToken);
        return tokens;
    }

    private generateNewAuthTokensPair(user: UserEntity): AuthTokens {
        const getTokenPayload = (type): Partial<TokenPayload> => ({
            email: user.email,
            role: user.role,
            type: type,
        });
        return {
            accessToken: this.jwtService.sign(
                {
                    ...getTokenPayload('access'),
                },
                { expiresIn: '2h', issuer: 'CifraIntegration' },
            ),
            refreshToken: this.jwtService.sign(
                {
                    ...getTokenPayload('refresh'),
                },
                { expiresIn: '30d', issuer: 'CifraIntegration' },
            ),
        };
    }

    private updateUserRefreshToken(user: UserEntity, refreshToken: string) {
        return this.usersService.updateUserRefreshToken(user, refreshToken);
    }
}
