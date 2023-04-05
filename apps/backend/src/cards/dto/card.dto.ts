import { Exclude, instanceToPlain, Type } from 'class-transformer';
import { CardStatusEnum } from '@/shared/enums/cardStatus.enum';
import { CardTypeEnum } from '@/shared/enums/cardType.enum';
import { CardDataDto, CardDataUpdateDto } from '@/cards/dto/cardData.dto';
import { CardPositionDto } from './cardPosition.dto';
import { IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CardDto {
    @ApiProperty({
        required: true,
        readOnly: true,
        name: 'id',
        description: 'Card id',
        example: '8f51eaa5bd504a2e', // 3х сегментный UUIDv4
    })
    public id: string;

    @ApiProperty({
        required: true,
        name: 'position',
        description: 'Card position on the canvas',
    })
    @Type(() => CardPositionDto)
    @ValidateNested()
    public position: CardPositionDto;

    @Type(() => CardDataDto)
    @ValidateNested()
    @ApiProperty({
        required: true,
        name: 'data',
        description: 'Card data',
    })
    public data: CardDataDto;

    @IsString()
    @ApiProperty({
        required: true,
        description: 'Constant type',
    })
    public type = 'cardNode';

    @ApiProperty({
        readOnly: true,
        name: 'className',
        description: 'Card class name',
    })
    public className: CardTypeEnum | CardStatusEnum;

    @Exclude({ toPlainOnly: true })
    public toPlain() {
        return {
            positionX: this.position.x,
            positionY: this.position.y,
            ...instanceToPlain(this.data),
        };
    }
}

export class CardUpdateDto {
    @Type(() => CardPositionDto)
    @ValidateNested()
    @ApiProperty({
        required: true,
        name: 'position',
        description: 'Card position on the canvas',
    })
    public position: CardPositionDto;

    @Type(() => CardDataUpdateDto)
    @ValidateNested()
    @ApiProperty({
        required: true,
        name: 'data',
        description: 'Card data',
    })
    public data: CardDataUpdateDto;

    @Exclude({ toPlainOnly: true })
    public toPlain() {
        return {
            positionX: this.position.x,
            positionY: this.position.y,
            ...instanceToPlain(this.data),
        };
    }
}
