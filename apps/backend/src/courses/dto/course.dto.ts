import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CourseDto {
    @ApiProperty({
        name: 'code',
        description: 'Course code',
        readOnly: true,
        required: true,
    })
    public code: number;

    @IsString()
    @ApiProperty({
        name: 'name',
        description: 'Course name',
        required: true,
    })
    public name: string;
}
