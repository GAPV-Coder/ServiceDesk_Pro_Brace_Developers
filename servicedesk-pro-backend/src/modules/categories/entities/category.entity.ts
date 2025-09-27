import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export interface CategoryField {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'boolean';
    required: boolean;
    options?: string[]; // Para campos tipo select
    validation?: {
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: string;
    };
}

export interface CategorySLA {
    firstResponseHours: number;
    resolutionHours: number;
}

@Entity('categories')
export class Category extends BaseEntity {
    @Column({ unique: true, length: 100 })
    name: string;

    @Column({ length: 500 })
    description: string;

    @Column({ type: 'jsonb', default: '[]' })
    additionalFields: CategoryField[];

    @Column({ type: 'jsonb' })
    sla: CategorySLA;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 0 })
    sortOrder: number;

    @Column({ nullable: true, length: 50 })
    color: string; // Para UI

    @Column({ nullable: true, length: 50 })
    icon: string; // Para UI

    // Relaciones
    @OneToMany(() => Ticket, (ticket) => ticket.category)
    tickets: Ticket[];

    // Métodos de conveniencia
    getFieldById(fieldId: string): CategoryField | undefined {
        return this.additionalFields.find(field => field.id === fieldId);
    }

    getRequiredFields(): CategoryField[] {
        return this.additionalFields.filter(field => field.required);
    }

    calculateSLADates(createdAt: Date): { firstResponseDue: Date; resolutionDue: Date } {
        const firstResponseDue = new Date(createdAt);
        firstResponseDue.setHours(firstResponseDue.getHours() + this.sla.firstResponseHours);

        const resolutionDue = new Date(createdAt);
        resolutionDue.setHours(resolutionDue.getHours() + this.sla.resolutionHours);

        return { firstResponseDue, resolutionDue };
    }
}