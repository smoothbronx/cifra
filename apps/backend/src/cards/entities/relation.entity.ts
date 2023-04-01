import { CardEntity } from '@/cards/entities/card.entity';
import { CourseEntity } from '@/courses/course.entity';
import { Exclude, Expose } from 'class-transformer';
import {
    PrimaryColumn,
    JoinColumn,
    BaseEntity,
    ManyToOne,
    Entity,
} from 'typeorm';

@Entity('relations')
export class RelationEntity extends BaseEntity {
    @PrimaryColumn({
        nullable: false,
        name: 'uuid',
    })
    public readonly id: string;

    @Exclude({ toPlainOnly: true })
    @JoinColumn({ name: 'parent_id' })
    @ManyToOne(() => CardEntity, { eager: true })
    public parent: CardEntity;

    @Exclude({ toPlainOnly: true })
    @JoinColumn({ name: 'child_id' })
    @ManyToOne(() => CardEntity, { eager: true })
    public child: CardEntity;

    @Exclude({ toPlainOnly: true })
    @JoinColumn({ name: 'course_id' })
    @ManyToOne(() => CourseEntity, (course) => course.relations, {
        lazy: true,
        nullable: false,
    })
    public course: Promise<CourseEntity>;

    @Expose({ toPlainOnly: true, name: 'source' })
    private getSource(): string {
        return this.parent.id;
    }

    @Expose({ toPlainOnly: true, name: 'target' })
    private getTarget(): string {
        return this.child.id;
    }
}
