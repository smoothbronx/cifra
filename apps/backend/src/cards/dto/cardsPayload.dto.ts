import { RelationDto } from '@/cards/dto/relation.dto';
import { CardDto } from '@/cards/dto/card.dto';

export class CardsPayloadDto {
    initial: CardDto[];
    relations: RelationDto[];
}
