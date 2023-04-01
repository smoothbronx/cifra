import { CardEntity } from '@/cards/entities/card.entity';
import { CourseEntity } from '@/courses/course.entity';
import { UserEntity } from '@/users/user.entity';
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
    @ManyToMany(() => CardEntity, (card) => card.openedAt, {
        eager: true,
        nullable: false,
    })
    public opened: CardEntity[];

    @JoinTable()
    @ManyToMany(() => CardEntity, (card) => card.closedAt, {
        eager: true,
        nullable: false,
    })
    public closed: CardEntity[];

    @JoinTable()
    @ManyToMany(() => CardEntity, (card) => card.finishedAt, {
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
}
