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
    Index,
} from 'typeorm';

@Entity('cards')
export class CardEntity extends BaseEntity {
    @PrimaryColumn()
    public readonly id: string;

    @Exclude({ toPlainOnly: true })
    @Column({ nullable: false, name: 'position_x' })
    public positionX: number;

    @Exclude({ toPlainOnly: true })
    @Column({ nullable: false, name: 'position_y' })
    public positionY: number;

    @Exclude({ toPlainOnly: true })
    @Column({ nullable: false, name: 'label' })
    public label: string;

    @Exclude({ toPlainOnly: true })
    @Column({ nullable: false, name: 'type' })
    public type: CardTypeEnum;

    @Exclude({ toPlainOnly: true })
    @ManyToOne(() => CourseEntity, (course) => course.cards, {
        lazy: true,
        nullable: true,
    })
    public course: Promise<CourseEntity>;

    @Exclude({ toPlainOnly: true })
    @Index({ unique: false })
    @ManyToOne(() => CardEntity, (parentCard) => parentCard.childs, {
        nullable: true,
        onDelete: 'CASCADE',
        lazy: true,
    })
    public parent: Promise<CardEntity>;

    @Exclude({ toPlainOnly: true })
    @JoinColumn({ name: 'course_id' })
    @ManyToOne(() => CardEntity, (parentCard) => parentCard.parent, {
        lazy: true,
        nullable: true,
    })
    public childs: Promise<CardEntity[]>;

    @Exclude({ toPlainOnly: true })
    @Column({ type: 'jsonb', nullable: true, name: 'content' })
    public content: any;

    @Exclude({ toPlainOnly: true })
    @ManyToMany(
        () => AvailabilityEntity,
        (availability) => availability.opened,
        { lazy: true, nullable: true },
    )
    public openedAt: AvailabilityEntity[];

    @Exclude({ toPlainOnly: true })
    @ManyToMany(
        () => AvailabilityEntity,
        (availability) => availability.closed,
        { lazy: true, nullable: true },
    )
    public closedAt: AvailabilityEntity[];

    @Exclude({ toPlainOnly: true })
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
}
