import { CardStatusEnum } from '@/cards/enums/cardStatus.enum';
import { CardTypeEnum } from '@/cards/enums/cardType.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class CardDataDto {
    @ApiProperty({
        name: 'label',
        description: 'Label in the card',
        required: true,
        example: 'Lesson 1',
    })
    public label: string;

    @ApiProperty({
        name: 'type',
        description: 'Card type',
        example: 'textarea',
    })
    public type: CardTypeEnum;

    @ApiProperty({
        name: 'content',
        description: 'Content in the card',
        required: true,
        example: { ping: 'pong' },
    })
    public content: any;

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
