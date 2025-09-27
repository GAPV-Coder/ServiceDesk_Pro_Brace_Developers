import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export enum AuditAction {
    TICKET_CREATED = 'ticket_created',
    TICKET_UPDATED = 'ticket_updated',
    TICKET_STATUS_CHANGED = 'ticket_status_changed',
    TICKET_ASSIGNED = 'ticket_assigned',
    TICKET_COMMENTED = 'ticket_commented',
    USER_CREATED = 'user_created',
    USER_UPDATED = 'user_updated',
    CATEGORY_CREATED = 'category_created',
    CATEGORY_UPDATED = 'category_updated',
}

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
    @Column({
        type: 'enum',
        enum: AuditAction,
    })
    action: AuditAction;

    @Column({ length: 100 })
    entityType: string; // 'ticket', 'user', 'category'

    @Column()
    entityId: string;

    @Column({ type: 'jsonb', nullable: true })
    oldValues: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    newValues: Record<string, any>;

    @Column({ length: 500, nullable: true })
    description: string;

    @Column({ length: 45, nullable: true })
    ipAddress: string;

    @Column({ length: 255, nullable: true })
    userAgent: string;

    // Relaciones
    @ManyToOne(() => User, (user) => user.auditLogs)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => Ticket, (ticket) => ticket.auditLogs, { nullable: true })
    @JoinColumn({ name: 'ticket_id' })
    ticket: Ticket;

    @Column({ name: 'ticket_id', nullable: true })
    ticketId: string;
}