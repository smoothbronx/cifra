import {
    Body,
    Controller,
    Get,
    Post,
    UnauthorizedException,
} from '@nestjs/common';
import { Token } from '@/shared/decorators/token.decorator';
import { AuthSignInDto } from '@/auth/dto/auth.signin.dto';
import { AuthService } from '@/auth/auth.service';
import { AuthTokens, AuthTokensDto } from '@/@types/AuthTokens';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiHeader,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiBasicAuth,
} from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { InvalidJwtExceptionSchema } from '@/swagger/schemas/invalidJwtException.schema';

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
