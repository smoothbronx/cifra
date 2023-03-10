import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BranchDto {
    @ApiProperty({ required: true, readOnly: true })
    public readonly code: number;

    @IsString()
    @ApiProperty({ required: true, example: 'Калининград' })
    public name: string;
}
