import { AvailabilityEntity } from '@/availability/availability.entity';
import { BranchEntity } from '@/branches/branch.entity';
import { PostEntity } from '@/posts/post.entity';
import { Role } from '@/shared/enums/Role.enum';
import { Exclude } from 'class-transformer';
import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    BaseEntity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    Column,
    Entity,
} from 'typeorm';
import { CourseEntity } from '@/courses/course.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    public readonly id: number;

    @Column({ unique: true, nullable: false, name: 'email' })
    public email: string;

    @Column({ nullable: false, name: 'phone' })
    public phone: string;

    @Column({ nullable: false, name: 'first_name' })
    public firstName: string;

    @Column({ nullable: false, name: 'last_name' })
    public lastName: string;

    @Column({ nullable: true, name: 'patronymic' })
    public patronymic?: string;

    @ManyToOne(() => BranchEntity, {
        eager: true,
        cascade: false,
        nullable: true,
    })
    @JoinColumn({ name: 'branch_id' })
    public branch: BranchEntity;

    @Column({ nullable: false, enum: Role, name: 'role' })
    public role: Role;

    @ManyToOne(() => PostEntity, {
        eager: true,
        cascade: false,
        nullable: true,
    })
    @JoinColumn({ name: 'post_id' })
    public post: PostEntity;

    @CreateDateColumn({
        nullable: false,
        name: 'created_at',
        type: 'timestamp',
    })
    public createdAt: Date;

    @Column({ type: 'timestamp', nullable: true, name: 'last_entry' })
    public lastEntry: Date;

    @JoinColumn({ name: 'course_id' })
    @ManyToOne(() => CourseEntity, (course) => course.students, {
        eager: true,
        nullable: true,
    })
    public course?: CourseEntity;

    @Exclude({ toPlainOnly: true })
    @Column({ nullable: true, name: 'refresh_token' })
    public refresh: string;

    @Exclude({ toPlainOnly: true })
    @Column({ nullable: false, name: 'password' })
    public password: string;

    @Exclude({ toPlainOnly: true })
    @JoinColumn({ name: 'availability_id' })
    @OneToOne(() => AvailabilityEntity, (cards) => cards.user, {
        eager: true,
        cascade: true,
        nullable: true,
    })
    public cards: AvailabilityEntity;

    @Exclude({ toPlainOnly: true })
    public getFullName(): string {
        return `${this.lastName} + ${this.firstName} ${this.patronymic}`.trim();
    }
}
