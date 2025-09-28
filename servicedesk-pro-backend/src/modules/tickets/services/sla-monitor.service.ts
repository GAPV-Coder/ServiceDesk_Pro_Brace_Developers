import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Ticket, SLAStatus, TicketStatus } from '../entities/ticket.entity';
import { SLAService } from '../../../shared/services/sla.service';

@Injectable()
export class SLAMonitorService {
    constructor(
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
        private slaService: SLAService,
        private eventEmitter: EventEmitter2,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async monitorSLAStatus() {
        console.log('🔍 Running SLA monitoring check...');

        // Obtener todos los tickets abiertos
        const openTickets = await this.ticketRepository.find({
            where: {
                status: In([
                    TicketStatus.OPEN,
                    TicketStatus.IN_PROGRESS,
                    TicketStatus.PENDING_CUSTOMER,
                    TicketStatus.PENDING_VENDOR,
                ]),
            },
            relations: ['requester', 'assignedAgent', 'category'],
        });

        const ticketsToUpdate: Ticket[] = [];
        let breachCount = 0;
        let riskCount = 0;

        for (const ticket of openTickets) {
            const originalFirstResponseStatus = ticket.firstResponseSLAStatus;
            const originalResolutionStatus = ticket.resolutionSLAStatus;

            // Actualizar SLA status
            this.slaService.updateTicketSLAStatus(ticket);

            // Verificar si cambió a breach
            if (originalFirstResponseStatus !== SLAStatus.BREACHED &&
                ticket.firstResponseSLAStatus === SLAStatus.BREACHED) {
                breachCount++;
                this.eventEmitter.emit('ticket.sla.breached', {
                    ticket,
                    slaType: 'first_response',
                });
            }

            if (originalResolutionStatus !== SLAStatus.BREACHED &&
                ticket.resolutionSLAStatus === SLAStatus.BREACHED) {
                breachCount++;
                this.eventEmitter.emit('ticket.sla.breached', {
                    ticket,
                    slaType: 'resolution',
                });
            }

            // Contar tickets en riesgo
            if (ticket.firstResponseSLAStatus === SLAStatus.AT_RISK ||
                ticket.resolutionSLAStatus === SLAStatus.AT_RISK) {
                riskCount++;
            }

            // Marcar para actualización si cambió
            if (originalFirstResponseStatus !== ticket.firstResponseSLAStatus ||
                originalResolutionStatus !== ticket.resolutionSLAStatus) {
                ticketsToUpdate.push(ticket);
            }
        }

        // Actualizar tickets que cambiaron
        if (ticketsToUpdate.length > 0) {
            await this.ticketRepository.save(ticketsToUpdate);
            console.log(`📊 Updated SLA status for ${ticketsToUpdate.length} tickets`);
        }

        if (breachCount > 0 || riskCount > 0) {
            console.log(`⚠️ SLA Alert: ${breachCount} breaches, ${riskCount} at risk`);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async generateDailySLAReport() {
        console.log('📊 Generating daily SLA report...');

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Obtener tickets creados ayer
        const yesterdayTickets = await this.ticketRepository
            .createQueryBuilder('ticket')
            .where('ticket.createdAt >= :yesterday', { yesterday })
            .andWhere('ticket.createdAt < :today', { today })
            .getMany();

        // Calcular métricas
        const totalTickets = yesterdayTickets.length;
        const breachedTickets = yesterdayTickets.filter(ticket =>
            ticket.firstResponseSLAStatus === SLAStatus.BREACHED ||
            ticket.resolutionSLAStatus === SLAStatus.BREACHED
        ).length;

        const compliance = totalTickets > 0
            ? ((totalTickets - breachedTickets) / totalTickets * 100).toFixed(1)
            : '100';

        console.log(`📈 Daily SLA Report - Total: ${totalTickets}, Breached: ${breachedTickets}, Compliance: ${compliance}%`);

        // Aquí podrías enviar el reporte por email o guardarlo
        // await this.reportService.saveDailySLAReport({...});
    }
}