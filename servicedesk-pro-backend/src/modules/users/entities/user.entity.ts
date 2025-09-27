import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Ticket } from '../../../modules/tickets/entities/ticket.entity';
import { AuditLog } from '../../../modules/audit/entities/audit-log.entity';

export enum UserRole {
    REQUESTER = 'requester',
    AGENT = 'agent',
    MANAGER = 'manager',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
}

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ length: 100 })
    first_name: string;

    @Column({ length: 100 })
    last_name: string;

    @Column({ select: false })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.REQUESTER,
    })
    role: UserRole;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    })
    status: UserStatus;

    @Column({ nullable: true, length: 255 })
    department: string;

    @Column({ nullable: true, length: 100 })
    jobTitle: string;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    // Relaciones
    @OneToMany(() => Ticket, (ticket) => ticket.requester)
    requestedTickets: Ticket[];

    @OneToMany(() => Ticket, (ticket) => ticket.assignedAgent)
    assignedTickets: Ticket[];

    @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
    auditLogs: AuditLog[];

    // Métodos de conveniencia
    get fullName(): string {
        return `${this.first_name} ${this.last_name}`;
    }

    isActive(): boolean {
        return this.status === UserStatus.ACTIVE;
    }

    hasRole(role: UserRole): boolean {
        return this.role === role;
    }

    canManageTickets(): boolean {
        return this.role === UserRole.AGENT || this.role === UserRole.MANAGER;
    }

    canViewDashboard(): boolean {
        return this.role === UserRole.MANAGER;
    }
}