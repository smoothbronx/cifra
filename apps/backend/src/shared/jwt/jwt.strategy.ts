import { UnauthorizedException, Injectable } from '@nestjs/common';
import { TokenPayload } from '@/@types/TokenPayload';
import { UsersService } from '@/users/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { UserEntity } from '@/users/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('JWT_PRIVATE_KEY'),
        });
    }

    public validate(payload: TokenPayload): Promise<UserEntity> {
        if (payload.type !== 'access') throw new UnauthorizedException();
        try {
            return this.usersService.getUserByEmail(payload.email);
        } catch {
            throw new UnauthorizedException();
        }
    }
}
