import { ApiProperty } from '@nestjs/swagger';

export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

export class AuthTokensDto {
    @ApiProperty({ required: true, readOnly: true })
    accessToken: string;
    @ApiProperty({ required: true, readOnly: true })
    refreshToken: string;
}
