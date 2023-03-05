import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PostDto {
    @ApiProperty({ required: true, readOnly: true })
    public readonly code: number;

    @IsString()
    @ApiProperty({ required: true })
    public name: string;
}
