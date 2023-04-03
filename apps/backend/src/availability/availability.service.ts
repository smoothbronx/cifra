import { AvailabilityEntity } from '@/availability/availability.entity';
import { CardStatusEnum } from '@/shared/enums/cardStatus.enum';
import { CardEntity } from '@/cards/entities/card.entity';
import { UsersService } from '@/users/users.service';
import { instanceToPlain } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@/users/user.entity';
import { Role } from '@/shared/enums/Role.enum';
import { CardDto } from '@/cards/dto/card.dto';
import { Repository } from 'typeorm';
import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
} from '@nestjs/common';
import { CourseEntity } from '@/courses/course.entity';

@Injectable()
export class AvailabilityService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,
        @InjectRepository(AvailabilityEntity)
        private readonly availabilityRepository: Repository<AvailabilityEntity>,
        @InjectRepository(CardEntity)
        private readonly cardsRepository: Repository<CardEntity>,
    ) {}

    // TODO: Перенести параметры в отдельный тип
    public async attachCardToUsers(
        card: CardEntity,
        options: { isFirst: boolean },
    ) {
        const users = await this.usersService.getUsers();

        for (const user of users) {
            await this.attachCardToUser(user, card, options);
        }
    }

    public async changeCardStatus(
        user: UserEntity,
        card: CardEntity,
        status: { from: CardStatusEnum; to: CardStatusEnum },
    ): Promise<CardDto> {
        if (status.to !== status.from) {
            await this.deleteCardFromStatusGroup(user, card, status.from);
            await this.pushCardToStatusGroup(user, card, status.to);

            for (const child of await card.childs) {
                await this.changeCardStatus(user, child, {
                    from: await this.getCardStatus(user, child),
                    to: this.getUpdatedChildStatus(status.to),
                });
            }
        }
        card = await this.cardsRepository.findOneByOrFail({ id: card.id });
        return this.getAugmentedCard(user, card);
    }

    public async getAugmentedCard(
        user: UserEntity,
        card: CardEntity,
    ): Promise<CardDto> {
        const plainCard = instanceToPlain(card) as CardDto;
        const cardStatus = await this.getCardStatus(user, card);

        plainCard.data.status = cardStatus;
        if (cardStatus === CardStatusEnum.CLOSED) return plainCard;

        plainCard.className =
            cardStatus === CardStatusEnum.FINISHED
                ? CardStatusEnum.FINISHED
                : card.type;
        return plainCard;
    }

    private getUpdatedChildStatus(
        parentStatus: CardStatusEnum,
    ): CardStatusEnum {
        if (parentStatus === CardStatusEnum.FINISHED)
            return CardStatusEnum.OPENED;

        if (parentStatus === CardStatusEnum.OPENED)
            return CardStatusEnum.CLOSED;

        if (parentStatus === CardStatusEnum.CLOSED)
            return CardStatusEnum.CLOSED;

        throw new BadRequestException('Unknown card status');
    }

    public async getInitialAvailability(
        course: CourseEntity,
        user: UserEntity,
    ) {
        const cards = await this.cardsRepository.findBy({
            course: { id: course.id },
        });

        user.cards = this.availabilityRepository.create({
            course: Promise.resolve(course),
        });
        await this.usersService.saveUser(user);

        if (cards.length > 0) {
            const upperCard = await this.getUpperCard(cards[0]);
            return this.attachCardsTreeToUser(user, upperCard);
        }
    }

    public async getUpperCard(initialCard: CardEntity): Promise<CardEntity> {
        const parent = await initialCard.parent;
        if (parent === null) return initialCard;
        return this.getUpperCard(parent);
    }

    public async attachCardsTreeToUser(
        user: UserEntity,
        parentCard: CardEntity,
    ): Promise<void> {
        await this.attachCardToUser(user, parentCard, {
            isFirst: !(await parentCard.parent),
        });

        const cardChilds = await parentCard.childs;
        if (cardChilds) {
            for (const childCard of cardChilds) {
                await this.attachCardsTreeToUser(user, childCard);
            }
        }
    }

    private async getCardStatus(
        user: UserEntity,
        card: CardEntity,
    ): Promise<CardStatusEnum> {
        if ([Role.ADMIN, Role.EDITOR].includes(user.role)) {
            return CardStatusEnum.OPENED;
        }

        const availability: AvailabilityEntity =
            await this.availabilityRepository.findOneByOrFail({
                id: user.cards.id,
            });

        if (this.groupIncludes(availability.opened, card))
            return CardStatusEnum.OPENED;

        if (this.groupIncludes(availability.closed, card))
            return CardStatusEnum.CLOSED;

        if (this.groupIncludes(availability.finished, card))
            return CardStatusEnum.FINISHED;

        throw new BadRequestException('Card not found in any status group');
    }

    private groupIncludes(group: CardEntity[], card: CardEntity): boolean {
        const groupIds = group.map((_card) => _card.id);
        return groupIds.includes(card.id);
    }

    public async pushCardToStatusGroup(
        user: UserEntity,
        card: CardEntity,
        status: CardStatusEnum,
    ) {
        const availability: AvailabilityEntity =
            await this.availabilityRepository.findOneByOrFail({
                id: user.cards.id,
            });

        if (status === CardStatusEnum.OPENED) {
            availability.opened.push(card);
        }
        if (status === CardStatusEnum.CLOSED) {
            availability.closed.push(card);
        }
        if (status === CardStatusEnum.FINISHED) {
            availability.finished.push(card);
        }

        return this.availabilityRepository.save(availability);
    }

    public async deleteCardFromStatusGroup(
        user: UserEntity,
        card: CardEntity,
        status: CardStatusEnum,
    ): Promise<AvailabilityEntity> {
        const availability: AvailabilityEntity =
            await this.availabilityRepository.findOneByOrFail({
                id: user.cards.id,
            });

        const filter = (arr) =>
            arr.filter((iterCard) => iterCard.id !== card.id);

        if (status === CardStatusEnum.OPENED) {
            if (!this.groupIncludes(availability.opened, card))
                throw new BadRequestException(
                    'Card not found in this status group',
                );
            availability.opened = filter(availability.opened);
        }

        if (status === CardStatusEnum.CLOSED) {
            if (!this.groupIncludes(availability.closed, card))
                throw new BadRequestException(
                    'Card not found in this status group',
                );
            availability.closed = filter(availability.closed);
        }

        if (status === CardStatusEnum.FINISHED) {
            if (!this.groupIncludes(availability.finished, card))
                throw new BadRequestException(
                    'Card not found in this status group',
                );
            availability.finished = filter(availability.finished);
        }

        return this.availabilityRepository.save(availability);
    }

    private async attachCardToUser(
        user: UserEntity,
        card: CardEntity,
        options: { isFirst: boolean },
    ): Promise<void> {
        // Пользователям роли редактора и админа доступны все карты
        if ([Role.EDITOR, Role.ADMIN].includes(user.role)) {
            return;
        }

        const availability: AvailabilityEntity =
            await this.availabilityRepository.findOneByOrFail({
                id: user.cards.id,
            });

        // Если карта первая, то она автоматически является открытой
        if (options.isFirst) {
            availability.opened.push(card);
        } else {
            availability.closed.push(card);
        }

        await this.availabilityRepository.save(availability);
    }
}
