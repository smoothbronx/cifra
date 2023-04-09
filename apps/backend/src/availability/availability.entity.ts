import { CardEntity } from '@/cards/entities/card.entity';
import { UserStatisticDto } from '@/users/dto/user.dto';
import { CourseEntity } from '@/courses/course.entity';
import { UserEntity } from '@/users/user.entity';
import { Exclude } from 'class-transformer';
import {
    PrimaryGeneratedColumn,
    BaseEntity,
    ManyToMany,
    JoinColumn,
    JoinTable,
    ManyToOne,
    OneToOne,
    Entity,
} from 'typeorm';

@Entity('availabilities')
export class AvailabilityEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @OneToOne(() => UserEntity, (user) => user.cards, {
        nullable: false,
    })
    public user: UserEntity;

    @JoinTable()
    @ManyToMany(() => CardEntity, (card) => card.openedIn, {
        eager: true,
        nullable: false,
    })
    public opened: CardEntity[];

    @JoinTable()
    @ManyToMany(() => CardEntity, (card) => card.closedIn, {
        eager: true,
        nullable: false,
    })
    public closed: CardEntity[];

    @JoinTable()
    @ManyToMany(() => CardEntity, (card) => card.finishedIn, {
        eager: true,
        nullable: false,
    })
    public finished: CardEntity[];

    @JoinColumn({ name: 'course_id' })
    @ManyToOne(() => CourseEntity, (course) => course.availabilities, {
        lazy: true,
        nullable: false,
    })
    public course: Promise<CourseEntity>;

    @Exclude({ toPlainOnly: true })
    public getTotalCards(): CardEntity[] {
        return [...this.opened, ...this.closed, ...this.finished];
    }

    @Exclude({ toPlainOnly: true })
    public getStatistic(): UserStatisticDto {
        const allCards = this.getTotalCards().length;
        const cardsPassed = this.finished.length;

        return {
            allCards,
            cardsPassed,
            progressPercent: Math.round(allCards / cardsPassed) | 0,
        };
    }
}
