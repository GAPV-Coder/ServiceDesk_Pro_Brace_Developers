import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { User } from '../../users/entities/user.entity';
import { AuditService } from '../../../shared/services/audit.service';
import { AuditAction } from '../../audit/entities/audit-log.entity';

interface TicketEvent {
    ticket: Ticket;
    user: User;
    [key: string]: any;
}

@Injectable()
export class TicketEventsService {
    constructor(
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
        private auditService: AuditService,
    ) { }

    @OnEvent('ticket.created')
    async handleTicketCreated(event: TicketEvent) {
        const { ticket, user } = event;

        // Crear log de auditoría
        await this.auditService.createLog({
            action: AuditAction.TICKET_CREATED,
            entityType: 'ticket',
            entityId: ticket.id,
            userId: user.id,
            newValues: {
                ticketNumber: ticket.ticketNumber,
                title: ticket.title,
                categoryId: ticket.categoryId,
                priority: ticket.priority,
            },
            description: `Ticket ${ticket.ticketNumber} created`,
            ticketId: ticket.id,
        });

        console.log(`📧 [NOTIFICATION] New ticket created: ${ticket.ticketNumber}`);

        // Aquí podrías integrar con un servicio de notificaciones
        // await this.notificationService.notifyNewTicket(ticket);
    }

    @OnEvent('ticket.assigned')
    async handleTicketAssigned(event: TicketEvent & { agent: User; assignedBy: User }) {
        const { ticket, agent, assignedBy } = event;

        await this.auditService.createLog({
            action: AuditAction.TICKET_ASSIGNED,
            entityType: 'ticket',
            entityId: ticket.id,
            userId: assignedBy.id,
            newValues: {
                assignedAgentId: agent.id,
                assignedAgentName: agent.fullName,
            },
            description: `Ticket ${ticket.ticketNumber} assigned to ${agent.fullName}`,
            ticketId: ticket.id,
        });

        console.log(`📧 [NOTIFICATION] Ticket ${ticket.ticketNumber} assigned to ${agent.fullName}`);
    }

    @OnEvent('ticket.first.response')
    async handleFirstResponse(event: TicketEvent) {
        const { ticket, user } = event;

        console.log(`⏰ [SLA] First response provided for ticket ${ticket.ticketNumber} by ${user.fullName}`);

        // Aquí podrías actualizar métricas de SLA
        // await this.metricsService.recordFirstResponse(ticket);
    }

    @OnEvent('ticket.resolved')
    async handleTicketResolved(event: TicketEvent) {
        const { ticket, user } = event;

        await this.auditService.createLog({
            action: AuditAction.TICKET_STATUS_CHANGED,
            entityType: 'ticket',
            entityId: ticket.id,
            userId: user.id,
            newValues: {
                status: ticket.status,
                resolvedAt: ticket.resolvedAt,
            },
            description: `Ticket ${ticket.ticketNumber} resolved`,
            ticketId: ticket.id,
        });

        console.log(`✅ [SUCCESS] Ticket ${ticket.ticketNumber} resolved by ${user.fullName}`);
    }

    @OnEvent('ticket.commented')
    async handleTicketCommented(event: TicketEvent & { comment: any }) {
        const { ticket, user, comment } = event;

        console.log(`💬 [COMMENT] New comment on ticket ${ticket.ticketNumber} by ${user.fullName}`);

        // Notificar a stakeholders relevantes
        // await this.notificationService.notifyTicketComment(ticket, comment, user);
    }

    @OnEvent('ticket.sla.breached')
    async handleSLABreach(event: TicketEvent & { slaType: string }) {
        const { ticket, slaType } = event;

        console.log(`🚨 [SLA BREACH] Ticket ${ticket.ticketNumber} breached ${slaType} SLA`);

        // Notificar a managers sobre breach de SLA
        // await this.notificationService.notifySLABreach(ticket, slaType);

        // Crear alerta
        // await this.alertService.createSLAAlert(ticket, slaType);
    }
}