import { CardEntity } from '@/cards/entities/card.entity';
import { Exclude, Expose } from 'class-transformer';
import {
    PrimaryColumn,
    JoinColumn,
    BaseEntity,
    ManyToOne,
    Entity,
} from 'typeorm';

@Entity()
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

    @Expose({ toPlainOnly: true, name: 'source' })
    private getSource(): string {
        return this.parent.id;
    }

    @Expose({ toPlainOnly: true, name: 'target' })
    private getTarget(): string {
        return this.child.id;
    }
}
