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

@Entity({ name: 'posts' })
export class PostEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ nullable: false, name: 'name' })
    public name: string;

    @Exclude({ toPlainOnly: true })
    @JoinColumn({ name: 'users' })
    @OneToMany(() => UserEntity, (user) => user.post, {
        eager: false,
        cascade: false,
    })
    public users: UserEntity[];
}
