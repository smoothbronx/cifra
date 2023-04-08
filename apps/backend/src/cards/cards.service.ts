import { AvailabilityService } from '@/availability/availability.service';
import { RelationEntity } from '@/cards/entities/relation.entity';
import { CardStatusEnum } from '@/shared/enums/cardStatus.enum';
import { CardDto, CardUpdateDto } from '@/cards/dto/card.dto';
import { CardEntity } from '@/cards/entities/card.entity';
import { RelationDto } from '@/cards/dto/relation.dto';
import { CourseEntity } from '@/courses/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@/users/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import {
    MethodNotAllowedException,
    BadRequestException,
    ConflictException,
    NotFoundException,
    HttpException,
    forwardRef,
    Injectable,
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

    public getCards(course: CourseEntity): Promise<CardEntity[]> {
        return this.cardsRepository.find({
            where: {
                course: { id: course.id },
            },
            order: {
                createdAt: 'ASC',
            },
        });
    }

    public async setCardStatus(
        course: CourseEntity,
        user: UserEntity,
        cardId: string,
        status: { from: CardStatusEnum; to: CardStatusEnum },
    ): Promise<CardDto> {
        const card = await this.getCard(course, cardId);
        return this.availabilityService.changeCardStatus(user, card, status);
    }

    public async getCard(
        course: CourseEntity,
        cardId: string,
        exception: HttpException = new BadRequestException('Card not found'),
    ): Promise<CardEntity> {
        const card = await this.cardsRepository.findOneBy({
            id: cardId,
            course: { id: course.id },
        });

        if (!card) throw exception;

        return card;
    }

    public async createCard(
        user: UserEntity,
        course: CourseEntity,
        cardDto: CardDto,
    ): Promise<CardDto> {
        const cardsCount = await this.cardsRepository.count();
        const card = await this.cardsRepository
            .create({
                id: uuid4().split('-').splice(0, 3).join(''),
                ...cardDto.toPlain(),
                childs: Promise.resolve([]),
                content: cardDto.data.content,
            })
            .save();

        course.cards.push(card);
        await course.save();

        await this.availabilityService.attachCardToUsers(card, {
            isFirst: !cardsCount,
        });

        return this.availabilityService.getAugmentedCard(user, card);
    }

    public async updateCard(
        course: CourseEntity,
        cardId: string,
        cardDto: CardUpdateDto,
    ): Promise<void> {
        const card = await this.cardsRepository.findOneBy({
            id: cardId,
            course: {
                id: course.id,
            },
        });

        if (!card) {
            throw new NotFoundException('Card not found');
        }

        await this.cardsRepository.update(
            { id: card.id },
            { ...cardDto.toPlain(), content: cardDto.data.content },
        );
    }

    public async deleteCard(
        course: CourseEntity,
        cardId: string,
    ): Promise<void> {
        const card = await this.cardsRepository.findOneBy({
            id: cardId,
            course: { id: course.id },
        });

        if (!card) throw new NotFoundException('Card not found');

        if (((await card.childs) || []).length > 0)
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

    public getRelations(course: CourseEntity): Promise<RelationEntity[]> {
        return this.relationsRepository.findBy({ course: { id: course.id } });
    }

    public async getRelation(
        course: CourseEntity,
        relationId: string,
        exception: HttpException = new BadRequestException(
            'Relation not found',
        ),
    ): Promise<RelationEntity> {
        const relation = await this.relationsRepository.findOneBy({
            id: relationId,
            course: { id: course.id },
        });

        if (!relation) throw exception;
        return relation;
    }

    public async createRelation(
        course: CourseEntity,
        relationDto: RelationDto,
    ): Promise<RelationEntity> {
        const relationExists = await this.relationsRepository.exist({
            where: {
                id: relationDto.id,
                parent: { id: relationDto.source },
                child: { id: relationDto.target },
                course: { id: course.id },
            },
        });

        if (relationExists)
            throw new ConflictException('Relation already exists');

        const sourceCard = await this.getCard(
            course,
            relationDto.source,
            new BadRequestException('Source card not found'),
        );

        const targetCard = await this.getCard(
            course,
            relationDto.target,
            new BadRequestException('Target card not found'),
        );

        const relation = await this.relationsRepository
            .create({
                id: relationDto.id,
                parent: sourceCard,
                child: targetCard,
            })
            .save();

        course.relations.push(relation);
        await course.save();

        await this.cardsRepository.save({
            ...targetCard,
            parent: Promise.resolve(sourceCard),
        });

        const sourceChilds: CardEntity[] = (await sourceCard.childs) || [];
        sourceChilds.push(targetCard);

        await this.cardsRepository.save({
            ...sourceCard,
            childs: Promise.resolve(sourceChilds),
        });

        return relation;
    }

    public async deleteRelation(
        course: CourseEntity,
        relationId: string,
    ): Promise<void> {
        const relation = await this.relationsRepository.findOneBy({
            id: relationId,
            course: { id: course.id },
        });

        if (!relation) throw new NotFoundException('Relation not found');

        await this.relationsRepository.delete({ id: relation.id });
    }
}
