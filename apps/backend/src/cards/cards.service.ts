import { AvailabilityService } from '@/availability/availability.service';
import { RelationEntity } from '@/cards/entities/relation.entity';
import { CardStatusEnum } from '@/shared/enums/cardStatus.enum';
import { CardEntity } from '@/cards/entities/card.entity';
import { RelationDto } from '@/cards/dto/relation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@/users/user.entity';
import { CardDto } from '@/cards/dto/card.dto';
import { Repository } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import {
    MethodNotAllowedException,
    BadRequestException,
    ConflictException,
    NotFoundException,
    HttpException,
    Injectable,
    forwardRef,
    Inject,
} from '@nestjs/common';

@Injectable()
export class CardsService {
    constructor(
        @InjectRepository(CardEntity)
        private readonly cardsRepository: Repository<CardEntity>,
        @InjectRepository(RelationEntity)
        private readonly relationsRepository: Repository<RelationEntity>,
        @Inject(forwardRef(() => AvailabilityService))
        private readonly availabilityService: AvailabilityService,
    ) {}

    public getCards(): Promise<CardEntity[]> {
        return this.cardsRepository.find();
    }

    public async setCardStatus(
        user: UserEntity,
        cardId: string,
        status: { from: CardStatusEnum; to: CardStatusEnum },
    ): Promise<CardDto> {
        const card = await this.getCard(cardId);
        return this.availabilityService.changeCardStatus(user, card, status);
    }

    public async getCard(
        cardId: string,
        exception: HttpException = new BadRequestException('Card not found'),
    ): Promise<CardEntity> {
        const card = await this.cardsRepository.findOneBy({ id: cardId });
        if (!card) throw exception;
        return card;
    }

    public async createCard(cardDto: CardDto): Promise<CardEntity> {
        const cardsCount = await this.cardsRepository.count();

        let card = this.cardsRepository.create({
            id: uuid4().split('-').splice(0, 3).join(''),
            ...cardDto.toPlain(),
            childs: Promise.resolve([]),
            content: cardDto.data.content,
        });
        card = await this.cardsRepository.save(card);

        await this.availabilityService.attachCardToUsers(card, {
            isFirst: !cardsCount,
        });

        return card;
    }

    public async deleteCard(cardId: string): Promise<void> {
        const card = await this.cardsRepository.findOneBy({ id: cardId });

        if (!card) throw new NotFoundException('Card not found');

        if ((await card.childs).length > 0)
            throw new MethodNotAllowedException('The card has child');

        await this.deleteCardRelations(card);

        await card.remove();
    }

    private async deleteCardRelations(card: CardEntity): Promise<void> {
        const relations = await this.relationsRepository.findBy({
            child: {
                id: card.id,
            },
        });
        relations.map(async (relation) => await relation.remove());
    }

    public getRelations(): Promise<RelationEntity[]> {
        return this.relationsRepository.find();
    }

    public async getRelation(
        relationId: string,
        exception: HttpException = new BadRequestException(
            'Relation not found',
        ),
    ): Promise<RelationEntity> {
        const relation = await this.relationsRepository.findOneBy({
            id: relationId,
        });
        if (!relation) throw exception;
        return relation;
    }

    public async createRelation(
        relationDto: RelationDto,
    ): Promise<RelationEntity> {
        const relationExists = await this.relationsRepository.exist({
            where: {
                parent: { id: relationDto.source },
                child: { id: relationDto.target },
            },
        });

        if (relationExists)
            throw new ConflictException('Relation already exists');

        const sourceCard = await this.getCard(
            relationDto.source,
            new BadRequestException('Source card not found'),
        );

        const targetCard = await this.getCard(
            relationDto.target,
            new BadRequestException('Target card not found'),
        );

        const relation = this.relationsRepository.create({
            id: uuid4().split('-').splice(0, 3).join(''),
            parent: sourceCard,
            child: targetCard,
        });

        await this.cardsRepository.save({
            ...targetCard,
            parent: Promise.resolve(sourceCard),
        });

        const sourceChilds = await sourceCard.childs;
        sourceChilds.push(targetCard);

        await this.cardsRepository.save({
            ...sourceCard,
            childs: Promise.resolve(sourceChilds),
        });

        return relation.save();
    }

    public async deleteRelation(relationId: string): Promise<void> {
        const relation = await this.relationsRepository.findOneBy({
            id: relationId,
        });

        if (!relation) throw new NotFoundException('Relation not found');

        await this.relationsRepository.delete({ id: relation.id });
    }
}
