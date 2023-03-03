import { ApiProperty } from '@nestjs/swagger';

export class InvalidJwtExceptionSchema {
    @ApiProperty({
        example: 401,
    })
    status: number;

    @ApiProperty({
        example: 'Unauthorized',
    })
    error: string;

    @ApiProperty()
    message: string;
}
