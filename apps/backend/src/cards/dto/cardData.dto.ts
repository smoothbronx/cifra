import { CardStatusEnum } from '@/shared/enums/cardStatus.enum';
import { CardTypeEnum } from '@/shared/enums/cardType.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';

export class CardDataDto {
    @IsString()
    @ApiProperty({
        name: 'label',
        description: 'Label in the card',
        required: true,
        example: 'Lesson 1',
    })
    public label: string;

    @IsEnum(CardTypeEnum)
    @ApiProperty({
        name: 'type',
        description: 'Card type',
        example: 'text',
    })
    public type: CardTypeEnum;

    @ApiProperty({
        name: 'content',
        description: 'Content in the card',
        required: true,
        example: { ping: 'pong' },
    })
    public content: any;

    @IsEnum(CardStatusEnum)
    @ApiProperty({
        name: 'status',
        description: 'Status of the card',
        readOnly: true,
    })
    public status: CardStatusEnum = CardStatusEnum.CLOSED;

    @Exclude()
    public getContentAsString(): string {
        return this.content.toString();
    }
}

export class CardDataUpdateDto {
    @IsString()
    @ApiProperty({
        name: 'label',
        description: 'Label in the card',
        required: true,
        example: 'Lesson 1',
    })
    public label: string;

    @ApiProperty({
        name: 'content',
        description: 'Content in the card',
        required: true,
        example: { ping: 'pong' },
    })
    public content: any;
}
