import { InvalidJwtExceptionSchema } from '@/swagger/schemas/invalidJwtException.schema';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { AuthTokens, AuthTokensDto } from '@/@types/AuthTokens';
import { Token } from '@/shared/decorators/token.decorator';
import { AuthSignInDto } from '@/auth/dto/auth.signin.dto';
import { AuthService } from '@/auth/auth.service';
import {
    UnauthorizedException,
    Controller,
    HttpCode,
    Body,
    Post,
    Get,
} from '@nestjs/common';
import {
    ApiUnauthorizedResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiBasicAuth,
    ApiHeader,
    ApiTags,
} from '@nestjs/swagger';

@ApiOkResponse({
    description: 'Returns access and refresh tokens',
    type: AuthTokensDto,
})
@ApiTags('auth')
@Controller('/auth/')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiBasicAuth('LoginAuth')
    @ApiException(() => new UnauthorizedException('Incorrect credentials'))
    @HttpCode(200)
    @Post('/signin/')
    public async signIn(
        @Body() userCredentials: AuthSignInDto,
    ): Promise<AuthTokens> {
        return this.authService.signIn(userCredentials);
    }

    @ApiBearerAuth('RefreshTokenAuth')
    @ApiHeader({
        name: 'Authorization',
        description: 'Bearer refresh token',
        required: true,
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid refresh token',
        type: InvalidJwtExceptionSchema,
    })
    @Get('/refresh/')
    public async refreshTokens(@Token() refreshToken: string) {
        return this.authService.refreshTokens(refreshToken);
    }
}
