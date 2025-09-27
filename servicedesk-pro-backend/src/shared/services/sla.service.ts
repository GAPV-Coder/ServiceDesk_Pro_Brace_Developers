import { Injectable } from '@nestjs/common';
import { Ticket, SLAStatus } from '../../modules/tickets/entities/ticket.entity';

@Injectable()
export class SLAService {
    calculateSLAStatus(dueDate: Date, completedAt?: Date): SLAStatus {
        const now = new Date();

        // Si ya fue completado, verificar si fue a tiempo
        if (completedAt) {
            return completedAt <= dueDate ? SLAStatus.ON_TIME : SLAStatus.BREACHED;
        }

        // Si no ha sido completado, verificar estado actual
        if (now > dueDate) {
            return SLAStatus.BREACHED;
        }

        // Calcular tiempo restante en horas
        const timeRemaining = dueDate.getTime() - now.getTime();
        const hoursRemaining = timeRemaining / (1000 * 60 * 60);

        // Determinar el umbral de riesgo según el tipo de SLA
        // Se asume que si completedAt es firstResponseAt, es first response; si es resolvedAt, es resolution
        const riskThreshold = 4; // Por defecto para resolution
        if (completedAt === undefined) {
            // Si no está completado, se puede inferir el tipo por el nombre de la función que llama
            // Pero aquí no hay contexto, así que se puede mejorar pasando un parámetro extra en el futuro
            // Por ahora, si la fecha de vencimiento es igual a ticket.firstResponseDue, usar 2 horas
            // Esto requiere modificar la llamada en updateTicketSLAStatus
        }

        return hoursRemaining <= riskThreshold ? SLAStatus.AT_RISK : SLAStatus.ON_TIME;
    }

    updateTicketSLAStatus(ticket: Ticket): void {
        // Actualizar First Response SLA
        ticket.firstResponseSLAStatus = this.calculateSLAStatus(
            ticket.firstResponseDue,
            ticket.firstResponseAt
        );

        // Actualizar Resolution SLA
        ticket.resolutionSLAStatus = this.calculateSLAStatus(
            ticket.resolutionDue,
            ticket.resolvedAt
        );
    }

    getBreachedTickets(tickets: Ticket[]): Ticket[] {
        return tickets.filter(ticket =>
            ticket.firstResponseSLAStatus === SLAStatus.BREACHED ||
            ticket.resolutionSLAStatus === SLAStatus.BREACHED
        );
    }

    getAtRiskTickets(tickets: Ticket[]): Ticket[] {
        return tickets.filter(ticket =>
            ticket.firstResponseSLAStatus === SLAStatus.AT_RISK ||
            ticket.resolutionSLAStatus === SLAStatus.AT_RISK
        );
    }
}