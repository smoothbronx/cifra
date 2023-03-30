import { InvalidJwtExceptionSchema } from '@/swagger/schemas/invalidJwtException.schema';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { AvailabilityService } from '@/availability/availability.service';
import { RelationEntity } from '@/cards/entities/relation.entity';
import { AuthUser } from '@/shared/decorators/authUser.decorator';
import { CardStatusEnum } from '@/cards/enums/cardStatus.enum';
import { RelationDto } from '@/cards/dto/relation.dto';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { CardsService } from '@/cards/cards.service';
import { UserEntity } from '@/users/user.entity';
import { CardDto } from '@/cards/dto/card.dto';
import {
    BadRequestException,
    NotFoundException,
    ConflictException,
    Controller,
    UseGuards,
    HttpCode,
    Delete,
    Inject,
    Param,
    Body,
    Post,
    Get,
} from '@nestjs/common';
import {
    ApiUnauthorizedResponse,
    ApiNoContentResponse,
    ApiCreatedResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiHeader,
    ApiBody,
    ApiTags,
} from '@nestjs/swagger';

@ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token',
    required: true,
})
@ApiBearerAuth('AccessTokenAuth')
@ApiUnauthorizedResponse({
    description: 'Invalid access token',
    type: InvalidJwtExceptionSchema,
})
@ApiTags('cards')
@UseGuards(JwtAuthGuard)
@Controller('/cards/')
export class CardsController {
    constructor(
        @Inject(CardsService)
        private readonly cardsService: CardsService,
        @Inject(AvailabilityService)
        private readonly availabilityService: AvailabilityService,
    ) {}

    @ApiOkResponse({
        description: 'Return all relations or empty array',
        type: RelationDto,
        isArray: true,
    })
    @Get('/relations/')
    public getRelations(): Promise<RelationEntity[]> {
        return this.cardsService.getRelations();
    }

    @ApiOkResponse({
        description: 'Return relation',
        type: RelationDto,
    })
    @ApiException(() => new BadRequestException('Relation not found'), {
        description: 'The relation was not found',
    })
    @Get('/relations/:id/')
    public getRelation(
        @Param('id') relationId: string,
    ): Promise<RelationEntity> {
        return this.cardsService.getRelation(relationId);
    }

    @ApiCreatedResponse({
        description: 'Relation successfully created',
        type: RelationDto,
    })
    @ApiException(() => new ConflictException('Relation already exists'), {
        description: 'Relation already exists',
    })
    @ApiException(() => new BadRequestException('Source card not found'), {
        description: 'Source card with the current id not found',
    })
    @ApiException(() => new BadRequestException('Target card not found'), {
        description: 'Target card with the current id not found',
    })
    @HttpCode(201)
    @Post('/relations/')
    public createRelation(
        @Body() relationDto: RelationDto,
    ): Promise<RelationEntity> {
        return this.cardsService.createRelation(relationDto);
    }

    @ApiNoContentResponse({
        description: 'Relation successfully deleted',
    })
    @ApiException(() => new NotFoundException('Relation not found'))
    @HttpCode(204)
    @Delete('/relations/:id/')
    public deleteRelation(@Param('id') relationId: string): Promise<void> {
        return this.cardsService.deleteRelation(relationId);
    }

    @ApiOkResponse({
        description: 'Returns all cards',
        type: CardDto,
        isArray: true,
    })
    @Get('/')
    public async getCards(@AuthUser() user: UserEntity): Promise<CardDto[]> {
        const cards = await this.cardsService.getCards();
        const result: CardDto[] = [];
        for (const card of cards) {
            result.push(
                await this.availabilityService.getAugmentedCard(user, card),
            );
        }
        return result;
    }

    @ApiOkResponse({
        description: 'Return card',
        type: CardDto,
    })
    @ApiException(() => new BadRequestException('Card not found'), {
        description: 'The card was not found',
    })
    @Get('/:id/')
    public async getCard(
        @Param('id') cardId: string,
        @AuthUser() user: UserEntity,
    ): Promise<CardDto> {
        const card = await this.cardsService.getCard(cardId);
        return this.availabilityService.getAugmentedCard(user, card);
    }

    @ApiOkResponse({
        description: 'Return updated card',
        type: CardDto,
    })
    @ApiException(() => new BadRequestException('Card not found'), {
        description: 'The card was not found',
    })
    @ApiException(
        () => new BadRequestException('Card not found in this status group'),
        { description: 'Incorrect status group' },
    )
    @HttpCode(201)
    @Post('/:id/status')
    public async setCardStatus(
        @AuthUser() user: UserEntity,
        @Param('id') cardId: string,
        @Body() statusDto: { from: CardStatusEnum; to: CardStatusEnum },
    ): Promise<CardDto> {
        return this.cardsService.setCardStatus(user, cardId, statusDto);
    }

    @ApiCreatedResponse({
        description: 'Card successfully created',
        type: CardDto,
    })
    @ApiBody({
        description: 'Card',
        type: CardDto,
        required: true,
    })
    @HttpCode(201)
    @Post('/')
    public async createCard(
        @AuthUser() user: UserEntity,
        @Body() cardDto: CardDto,
    ): Promise<CardDto> {
        const card = await this.cardsService.createCard(cardDto);
        return this.availabilityService.getAugmentedCard(user, card);
    }

    @ApiNoContentResponse({ description: 'The card deletion was successful' })
    @ApiException(() => new NotFoundException('Card not found'), {
        description: 'The card being deleted was not found',
    })
    @HttpCode(204)
    @Delete('/:id/')
    public deleteCard(@Param('id') cardId: string): Promise<void> {
        return this.cardsService.deleteCard(cardId);
    }
}
