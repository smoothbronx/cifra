import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CardPositionDto {
    @IsNumber()
    @ApiProperty({
        name: 'x',
        description: 'x coordinate of canvas',
        required: true,
        example: 10,
    })
    public x: number;

    @IsNumber()
    @ApiProperty({
        name: 'y',
        description: 'y coordinate of canvas',
        required: true,
        example: 100,
    })
    public y: number;
}
