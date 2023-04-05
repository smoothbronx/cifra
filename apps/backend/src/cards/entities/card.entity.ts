import { AvailabilityEntity } from '@/availability/availability.entity';
import { CardPositionDto } from '@/cards/dto/cardPosition.dto';
import { CardTypeEnum } from '@/shared/enums/cardType.enum';
import { CourseEntity } from '@/courses/course.entity';
import { Exclude, Expose } from 'class-transformer';
import {
    PrimaryColumn,
    JoinColumn,
    BaseEntity,
    ManyToMany,
    ManyToOne,
    Column,
    Entity,
} from 'typeorm';

@Exclude({ toPlainOnly: true })
@Entity('cards')
export class CardEntity extends BaseEntity {
    @Expose()
    @PrimaryColumn()
    public readonly id: string;

    @Column({ type: 'double precision', nullable: false, name: 'position_x' })
    public positionX: number;

    @Column({ type: 'double precision', nullable: false, name: 'position_y' })
    public positionY: number;

    @Column({ nullable: false, name: 'label' })
    public label: string;

    @Column({ nullable: false, name: 'type' })
    public type: CardTypeEnum;

    @ManyToOne(() => CourseEntity, (course) => course.cards, {
        lazy: true,
        nullable: true,
    })
    public course: Promise<CourseEntity>;

    @ManyToOne(() => CardEntity, (parentCard) => parentCard.childs, {
        nullable: true,
        onDelete: 'CASCADE',
        lazy: true,
    })
    public parent: Promise<CardEntity>;

    @JoinColumn({ name: 'course_id' })
    @ManyToOne(() => CardEntity, (parentCard) => parentCard.parent, {
        lazy: true,
        nullable: true,
    })
    public childs: Promise<CardEntity[]>;

    @Column({ type: 'jsonb', nullable: true, name: 'content' })
    public content: any;

    @ManyToMany(
        () => AvailabilityEntity,
        (availability) => availability.opened,
        { lazy: true, nullable: true },
    )
    public openedAt: AvailabilityEntity[];

    @ManyToMany(
        () => AvailabilityEntity,
        (availability) => availability.closed,
        { lazy: true, nullable: true },
    )
    public closedAt: AvailabilityEntity[];

    @ManyToMany(
        () => AvailabilityEntity,
        (availability) => availability.finished,
        { lazy: true, nullable: true },
    )
    public finishedAt: AvailabilityEntity[];

    @Expose({ name: 'position', toPlainOnly: true })
    private positionToPlain(): CardPositionDto {
        return {
            x: this.positionX,
            y: this.positionY,
        };
    }

    @Expose({ name: 'data', toPlainOnly: true })
    private dataToPlain() {
        return {
            label: this.label,
            content: this.content,
        };
    }

    @Expose({ name: 'type', toPlainOnly: true })
    private getType() {
        return 'cardNode';
    }
}
