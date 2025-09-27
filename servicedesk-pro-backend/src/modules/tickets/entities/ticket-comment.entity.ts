import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Ticket } from './ticket.entity';
import { User } from '../../users/entities/user.entity';

export enum CommentType {
    PUBLIC = 'public',
    INTERNAL = 'internal',
    SYSTEM = 'system',
}

@Entity('ticket_comments')
export class TicketComment extends BaseEntity {
    @Column({ type: 'text' })
    content: string;

    @Column({
        type: 'enum',
        enum: CommentType,
        default: CommentType.PUBLIC,
    })
    type: CommentType;

    @Column({ default: false })
    isFirstResponse: boolean;

    // Relaciones
    @ManyToOne(() => Ticket, (ticket) => ticket.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ticket_id' })
    ticket: Ticket;

    @Column({ name: 'ticket_id' })
    ticketId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'author_id' })
    author: User;

    @Column({ name: 'author_id' })
    authorId: string;
}