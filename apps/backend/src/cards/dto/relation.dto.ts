import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RelationDto {
    @ApiProperty({
        name: 'id',
        description: 'Id of the relation',
        readOnly: true,
        example: 'rel1-2',
    })
    public id: string;

    @IsString()
    @ApiProperty({
        name: 'source',
        description: 'Parent card id',
        required: true,
        example: 'someParentCardID',
    })
    public source: string;

    @IsString()
    @ApiProperty({
        name: 'target',
        description: 'Child card id',
        required: true,
        example: 'someChildCardID',
    })
    public target: string;
}
