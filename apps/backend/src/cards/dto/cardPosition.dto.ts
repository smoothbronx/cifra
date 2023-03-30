import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CardPositionDto {
    @IsPositive()
    @IsNumber()
    @ApiProperty({
        name: 'x',
        description: 'x coordinate of canvas',
        required: true,
        example: 10,
    })
    public x: number;

    @ApiProperty({
        name: 'y',
        description: 'y coordinate of canvas',
        required: true,
        example: 100,
    })
    @IsPositive()
    @IsNumber()
    public y: number;
}
