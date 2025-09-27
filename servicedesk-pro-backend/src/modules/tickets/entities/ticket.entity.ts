import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../../modules/categories/entities/category.entity';
import { TicketComment } from './ticket-comment.entity';
import { AuditLog } from '../../../modules/audit/entities/audit-log.entity';

export enum TicketStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    PENDING_CUSTOMER = 'pending_customer',
    PENDING_VENDOR = 'pending_vendor',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
    CANCELLED = 'cancelled',
}

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum SLAStatus {
    ON_TIME = 'on_time',
    AT_RISK = 'at_risk',
    BREACHED = 'breached',
}

@Entity('tickets')
export class Ticket extends BaseEntity {
    @Column({ unique: true, length: 50 })
    ticketNumber: string;

    @Column({ length: 200 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.OPEN,
    })
    status: TicketStatus;

    @Column({
        type: 'enum',
        enum: TicketPriority,
        default: TicketPriority.MEDIUM,
    })
    priority: TicketPriority;

    @Column({ type: 'jsonb', default: '{}' })
    additionalData: Record<string, any>;

    // Campos de SLA
    @Column({ type: 'timestamp' })
    firstResponseDue: Date;

    @Column({ type: 'timestamp' })
    resolutionDue: Date;

    @Column({ type: 'timestamp', nullable: true })
    firstResponseAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    resolvedAt: Date;

    @Column({
        type: 'enum',
        enum: SLAStatus,
        default: SLAStatus.ON_TIME,
    })
    firstResponseSLAStatus: SLAStatus;

    @Column({
        type: 'enum',
        enum: SLAStatus,
        default: SLAStatus.ON_TIME,
    })
    resolutionSLAStatus: SLAStatus;

    // Snapshot de la categoría al momento de creación
    @Column({ type: 'jsonb' })
    categorySnapshot: {
        id: string;
        name: string;
        sla: {
            firstResponseHours: number;
            resolutionHours: number;
        };
        additionalFields: any[];
    };

    // Relaciones
    @ManyToOne(() => User, (user) => user.requestedTickets)
    @JoinColumn({ name: 'requester_id' })
    requester: User;

    @Column({ name: 'requester_id' })
    requesterId: string;

    @ManyToOne(() => Category, (category) => category.tickets)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({ name: 'category_id' })
    categoryId: string;

    @ManyToOne(() => User, (user) => user.assignedTickets, { nullable: true })
    @JoinColumn({ name: 'assigned_agent_id' })
    assignedAgent: User;

    @Column({ name: 'assigned_agent_id', nullable: true })
    assignedAgentId: string;

    @OneToMany(() => TicketComment, (comment) => comment.ticket)
    comments: TicketComment[];

    @OneToMany(() => AuditLog, (auditLog) => auditLog.ticket)
    auditLogs: AuditLog[];

    // Métodos de conveniencia
    isOpen(): boolean {
        return [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.PENDING_CUSTOMER, TicketStatus.PENDING_VENDOR].includes(this.status);
    }

    isClosed(): boolean {
        return [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED].includes(this.status);
    }

    canBeAssigned(): boolean {
        return this.isOpen();
    }

    canBeResolved(): boolean {
        return this.status === TicketStatus.IN_PROGRESS;
    }

    updateSLAStatus(): void {
        const now = new Date();

        // Primera Respuesta SLA
        if (!this.firstResponseAt) {
            if (now > this.firstResponseDue) {
                this.firstResponseSLAStatus = SLAStatus.BREACHED;
            } else {
                const timeToSLA = this.firstResponseDue.getTime() - now.getTime();
                const hoursToSLA = timeToSLA / (1000 * 60 * 60);
                this.firstResponseSLAStatus = hoursToSLA <= 2 ? SLAStatus.AT_RISK : SLAStatus.ON_TIME;
            }
        }

        // Resolución SLA
        if (!this.resolvedAt && this.isOpen()) {
            if (now > this.resolutionDue) {
                this.resolutionSLAStatus = SLAStatus.BREACHED;
            } else {
                const timeToSLA = this.resolutionDue.getTime() - now.getTime();
                const hoursToSLA = timeToSLA / (1000 * 60 * 60);
                this.resolutionSLAStatus = hoursToSLA <= 4 ? SLAStatus.AT_RISK : SLAStatus.ON_TIME;
            }
        }
    }
}