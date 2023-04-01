import { InvalidJwtExceptionSchema } from '@/swagger/schemas/invalidJwtException.schema';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { AvailabilityService } from '@/availability/availability.service';
import { CourseAccessGuard } from '@/shared/guards/courseAccess.guard';
import { AcceptRoles } from '@/shared/access/acceptRoles.decorator';
import { RelationEntity } from '@/cards/entities/relation.entity';
import { AuthUser } from '@/shared/decorators/authUser.decorator';
import { CardStatusEnum } from '@/shared/enums/cardStatus.enum';
import { RelationDto } from '@/cards/dto/relation.dto';
import { JwtAuthGuard } from '@/shared/jwt/jwt.guard';
import { CardsService } from '@/cards/cards.service';
import { UserEntity } from '@/users/user.entity';
import { Role } from '@/shared/enums/Role.enum';
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
    UseInterceptors,
    ForbiddenException,
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
    ApiParam,
} from '@nestjs/swagger';
import { CourseInterceptor } from '@/shared/interceptors/course.interceptor';
import { CourseEntity } from '@/courses/course.entity';
import { Course } from '@/shared/decorators/course.decorator';

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
@AcceptRoles()
@UseGuards(JwtAuthGuard, CourseAccessGuard)
@UseInterceptors(CourseInterceptor)
@Controller('courses/:cid/cards/')
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
    @ApiException(() => new NotFoundException('Course not found'), {
        description: 'Course not found',
    })
    @ApiParam({
        name: 'cid',
        description: 'Course ID',
    })
    @Get('/relations/')
    public getRelations(
        @Course() course: CourseEntity,
    ): Promise<RelationEntity[]> {
        return this.cardsService.getRelations(course);
    }

    @ApiOkResponse({
        description: 'Return relation',
        type: RelationDto,
    })
    @ApiException(() => new BadRequestException('Relation not found'), {
        description: 'The relation was not found',
    })
    @ApiException(() => new NotFoundException('Course not found'), {
        description: 'Course not found',
    })
    @ApiParam({
        name: 'cid',
        description: 'Course ID',
    })
    @Get('/relations/:id/')
    public getRelation(
        @Course() course: CourseEntity,
        @Param('id') relationId: string,
    ): Promise<RelationEntity> {
        return this.cardsService.getRelation(course, relationId);
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
    @ApiException(
        () =>
            new ForbiddenException(
                'Insufficient permissions to perform this operation',
            ),
        { description: 'The operation is not available to the user' },
    )
    @ApiException(() => new NotFoundException('Course not found'), {
        description: 'Course not found',
    })
    @ApiParam({
        name: 'cid',
        description: 'Course ID',
    })
    @AcceptRoles(Role.ADMIN, Role.EDITOR)
    @HttpCode(201)
    @Post('/relations/')
    public createRelation(
        @Course() course: CourseEntity,
        @Body() relationDto: RelationDto,
    ): Promise<RelationEntity> {
        return this.cardsService.createRelation(course, relationDto);
    }

    @ApiNoContentResponse({
        description: 'Relation successfully deleted',
    })
    @ApiException(() => new NotFoundException('Relation not found'))
    @ApiException(
        () =>
            new ForbiddenException(
                'Insufficient permissions to perform this operation',
            ),
        { description: 'The operation is not available to the user' },
    )
    @ApiException(() => new NotFoundException('Course not found'), {
        description: 'Course not found',
    })
    @ApiParam({
        name: 'cid',
        description: 'Course ID',
    })
    @AcceptRoles(Role.ADMIN, Role.EDITOR)
    @HttpCode(204)
    @Delete('/relations/:id/')
    public deleteRelation(
        @Course() course: CourseEntity,
        @Param('id') relationId: string,
    ): Promise<void> {
        return this.cardsService.deleteRelation(course, relationId);
    }

    @ApiOkResponse({
        description: 'Returns all cards',
        type: CardDto,
        isArray: true,
    })
    @ApiException(() => new NotFoundException('Course not found'), {
        description: 'Course not found',
    })
    @ApiParam({
        name: 'cid',
        description: 'Course ID',
    })
    @Get('/')
    public async getCards(
        @Course() course: CourseEntity,
        @AuthUser() user: UserEntity,
    ): Promise<CardDto[]> {
        const cards = await this.cardsService.getCards(course);
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
    @ApiException(() => new NotFoundException('Course not found'), {
        description: 'Course not found',
    })
    @ApiParam({
        name: 'cid',
        description: 'Course ID',
    })
    @Get('/:id/')
    public async getCard(
        @Course() course: CourseEntity,
        @Param('id') cardId: string,
        @AuthUser() user: UserEntity,
    ): Promise<CardDto> {
        const card = await this.cardsService.getCard(course, cardId);
        return this.availabilityService.getAugmentedCard(user, card);
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
    @ApiException(
        () =>
            new ForbiddenException(
                'Insufficient permissions to perform this operation',
            ),
        { description: 'The operation is not available to the user' },
    )
    @ApiException(() => new NotFoundException('Course not found'), {
        description: 'Course not found',
    })
    @ApiParam({
        name: 'cid',
        description: 'Course ID',
    })
    @AcceptRoles(Role.ADMIN, Role.EDITOR)
    @HttpCode(201)
    @Post('/')
    public async createCard(
        @Course() course: CourseEntity,
        @AuthUser() user: UserEntity,
        @Body() cardDto: CardDto,
    ): Promise<CardDto> {
        const card = await this.cardsService.createCard(course, cardDto);
        return this.availabilityService.getAugmentedCard(user, card);
    }

    @ApiNoContentResponse({ description: 'The card deletion was successful' })
    @ApiException(() => new NotFoundException('Card not found'), {
        description: 'The card being deleted was not found',
    })
    @ApiException(
        () =>
            new ForbiddenException(
                'Insufficient permissions to perform this operation',
            ),
        { description: 'The operation is not available to the user' },
    )
    @ApiException(() => new NotFoundException('Course not found'), {
        description: 'Course not found',
    })
    @ApiParam({
        name: 'cid',
        description: 'Course ID',
    })
    @AcceptRoles(Role.ADMIN, Role.EDITOR)
    @HttpCode(204)
    @Delete('/:id/')
    public deleteCard(
        @Course() course: CourseEntity,
        @Param('id') cardId: string,
    ): Promise<void> {
        return this.cardsService.deleteCard(course, cardId);
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
    @ApiException(() => new NotFoundException('Course not found'), {
        description: 'Course not found',
    })
    @ApiParam({
        name: 'cid',
        description: 'Course ID',
    })
    @HttpCode(201)
    @Post('/:id/status')
    public async setCardStatus(
        @Course() course: CourseEntity,
        @AuthUser() user: UserEntity,
        @Param('id') cardId: string,
        @Body() statusDto: { from: CardStatusEnum; to: CardStatusEnum },
    ): Promise<CardDto> {
        return this.cardsService.setCardStatus(course, user, cardId, statusDto);
    }
}
