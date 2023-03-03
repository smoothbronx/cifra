import { UserEntity } from '@/users/user.entity';
import { Exclude } from 'class-transformer';
import {
    PrimaryGeneratedColumn,
    JoinColumn,
    BaseEntity,
    OneToMany,
    Column,
    Entity,
} from 'typeorm';

@Entity({ name: 'branches' })
export class BranchEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ nullable: false, name: 'name' })
    public name: string;

    @Exclude({ toPlainOnly: true })
    @OneToMany(() => UserEntity, (user) => user.branch, {
        eager: false,
        cascade: false,
    })
    @JoinColumn({ name: 'users' })
    public users: UserEntity[];
}
