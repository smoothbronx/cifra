import { CardEntity } from '@/cards/entities/card.entity';
import { UserEntity } from '@/users/user.entity';
import {
    PrimaryGeneratedColumn,
    BaseEntity,
    ManyToMany,
    JoinTable,
    OneToOne,
    Entity,
} from 'typeorm';

@Entity()
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
}
