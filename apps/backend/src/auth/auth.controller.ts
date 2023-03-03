import { Body, Controller, Get, Post } from '@nestjs/common';
import { Token } from '@/shared/decorators/token.decorator';
import { AuthSignInDto } from '@/auth/dto/auth.signin.dto';
import { AuthService } from '@/auth/auth.service';
import { AuthTokens, AuthTokensDto } from '@/@types/AuthTokens';
import { ApiOkResponse } from '@nestjs/swagger';
import { UserDto } from '@/users/dto/user.dto';

@Controller('/auth/')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOkResponse({
        description: 'Returns access and refresh tokens',
        type: AuthTokensDto,
    })
    @Post('/signin/')
    public async signIn(
        @Body() userCredentials: AuthSignInDto,
    ): Promise<AuthTokens> {
        return this.authService.signIn(userCredentials);
    }

    @Get('/refresh/')
    public async refreshTokens(@Token() refreshToken: string) {
        return this.authService.refreshTokens(refreshToken);
    }
}
