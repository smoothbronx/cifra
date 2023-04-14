import { AvailabilityEntity } from '@/availability/availability.entity';
import { CardEntity } from '@/cards/entities/card.entity';
import { Exclude, Expose } from 'class-transformer';
import { UserEntity } from '@/users/user.entity';
import {
    PrimaryGeneratedColumn,
    BaseEntity,
    JoinColumn,
    OneToMany,
    Column,
    Entity,
} from 'typeorm';
import { RelationEntity } from '@/cards/entities/relation.entity';

@Entity('courses')
export class CourseEntity extends BaseEntity {
    @Expose({ toPlainOnly: true, name: 'code' })
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Column({ name: 'name', nullable: false })
    public name: string;

    @Exclude({ toPlainOnly: true })
    @JoinColumn()
    @OneToMany(() => UserEntity, (user) => user.course, {
        lazy: true,
    })
    public students: UserEntity;

    @Exclude({ toPlainOnly: true })
    @OneToMany(() => CardEntity, (card) => card.course, {
        eager: true,
        cascade: true,
        nullable: false,
        onDelete: 'CASCADE',
    })
    public cards: CardEntity[];

    @Exclude({ toPlainOnly: true })
    @OneToMany(
        () => AvailabilityEntity,
        (availability) => availability.course,
        {
            eager: true,
            cascade: true,
            nullable: false,
            onDelete: 'CASCADE',
        },
    )
    public availabilities: AvailabilityEntity[];

    @Exclude({ toPlainOnly: true })
    @OneToMany(() => RelationEntity, (relation) => relation.course, {
        eager: true,
        cascade: true,
        nullable: false,
        onDelete: 'CASCADE',
    })
    public relations: RelationEntity[];
}
