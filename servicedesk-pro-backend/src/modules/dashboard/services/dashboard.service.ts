import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, SLAStatus } from '../../tickets/entities/ticket.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { TicketComment } from '../../tickets/entities/ticket-comment.entity';
import { DashboardQueryDto } from '../dto/dashboard.schemas';

export interface DashboardMetrics {
    overview: {
        totalTickets: number;
        openTickets: number;
        resolvedTickets: number;
        closedTickets: number;
        slaBreached: number;
        slaAtRisk: number;
        averageResolutionTime: number; // en horas
        firstResponseTime: number; // en horas
    };
    ticketsByStatus: Array<{
        status: TicketStatus;
        count: number;
        percentage: number;
    }>;
    ticketsByCategory: Array<{
        categoryId: string;
        categoryName: string;
        count: number;
        percentage: number;
    }>;
    ticketsByPriority: Array<{
        priority: string;
        count: number;
        percentage: number;
    }>;
    agentPerformance: Array<{
        agentId: string;
        agentName: string;
        assignedTickets: number;
        resolvedTickets: number;
        averageResolutionTime: number;
        slaCompliance: number;
    }>;
    timeSeriesData: Array<{
        date: string;
        created: number;
        resolved: number;
        closed: number;
    }>;
    slaMetrics: {
        firstResponseSLA: {
            total: number;
            onTime: number;
            atRisk: number;
            breached: number;
            compliance: number;
        };
        resolutionSLA: {
            total: number;
            onTime: number;
            atRisk: number;
            breached: number;
            compliance: number;
        };
    };
}

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(TicketComment)
        private commentRepository: Repository<TicketComment>,
    ) { }

    async getDashboardMetrics(queryDto: DashboardQueryDto): Promise<DashboardMetrics> {
        const { period = '7d', categoryId, agentId } = queryDto;

        // Calcular fecha de inicio basada en el período
        const fromDate = this.getDateFromPeriod(period);

        // Construir query base
        let ticketQuery = this.ticketRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.requester', 'requester')
            .leftJoinAndSelect('ticket.assignedAgent', 'assignedAgent')
            .leftJoinAndSelect('ticket.category', 'category');

        if (fromDate) {
            ticketQuery = ticketQuery.where('ticket.createdAt >= :fromDate', { fromDate });
        }

        if (categoryId) {
            ticketQuery = ticketQuery.andWhere('ticket.categoryId = :categoryId', { categoryId });
        }

        if (agentId) {
            ticketQuery = ticketQuery.andWhere('ticket.assignedAgentId = :agentId', { agentId });
        }

        const tickets = await ticketQuery.getMany();

        // Calcular métricas
        const overview = await this.calculateOverviewMetrics(tickets);
        const ticketsByStatus = this.calculateTicketsByStatus(tickets);
        const ticketsByCategory = this.calculateTicketsByCategory(tickets);
        const ticketsByPriority = this.calculateTicketsByPriority(tickets);
        const agentPerformance = await this.calculateAgentPerformance(tickets, fromDate);
        const timeSeriesData = await this.calculateTimeSeriesData(fromDate, categoryId, agentId);
        const slaMetrics = this.calculateSLAMetrics(tickets);

        return {
            overview,
            ticketsByStatus,
            ticketsByCategory,
            ticketsByPriority,
            agentPerformance,
            timeSeriesData,
            slaMetrics,
        };
    }

    private getDateFromPeriod(period: string): Date {
        const now = new Date();
        const daysMap: Record<string, number> = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
        };

        const days = daysMap[period] || 7;
        const fromDate = new Date(now);
        fromDate.setDate(now.getDate() - days);
        fromDate.setHours(0, 0, 0, 0);

        return fromDate;
    }

    private async calculateOverviewMetrics(tickets: Ticket[]): Promise<DashboardMetrics['overview']> {
        const totalTickets = tickets.length;
        const openTickets = tickets.filter(t => t.isOpen()).length;
        const resolvedTickets = tickets.filter(t => t.status === TicketStatus.RESOLVED).length;
        const closedTickets = tickets.filter(t => t.status === TicketStatus.CLOSED).length;

        const slaBreached = tickets.filter(t =>
            t.firstResponseSLAStatus === SLAStatus.BREACHED ||
            t.resolutionSLAStatus === SLAStatus.BREACHED
        ).length;

        const slaAtRisk = tickets.filter(t =>
            t.firstResponseSLAStatus === SLAStatus.AT_RISK ||
            t.resolutionSLAStatus === SLAStatus.AT_RISK
        ).length;

        // Calcular tiempo promedio de resolución
        const resolvedTicketsWithTime = tickets.filter(t =>
            t.resolvedAt && t.createdAt
        );

        const averageResolutionTime = resolvedTicketsWithTime.length > 0
            ? resolvedTicketsWithTime.reduce((sum, ticket) => {
                const resolutionTime = ticket.resolvedAt!.getTime() - ticket.createdAt.getTime();
                return sum + (resolutionTime / (1000 * 60 * 60)); // convertir a horas
            }, 0) / resolvedTicketsWithTime.length
            : 0;

        // Calcular tiempo promedio de primera respuesta
        const ticketsWithFirstResponse = tickets.filter(t =>
            t.firstResponseAt && t.createdAt
        );

        const firstResponseTime = ticketsWithFirstResponse.length > 0
            ? ticketsWithFirstResponse.reduce((sum, ticket) => {
                const responseTime = ticket.firstResponseAt!.getTime() - ticket.createdAt.getTime();
                return sum + (responseTime / (1000 * 60 * 60)); // convertir a horas
            }, 0) / ticketsWithFirstResponse.length
            : 0;

        return {
            totalTickets,
            openTickets,
            resolvedTickets,
            closedTickets,
            slaBreached,
            slaAtRisk,
            averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
            firstResponseTime: Math.round(firstResponseTime * 100) / 100,
        };
    }

    private calculateTicketsByStatus(tickets: Ticket[]): DashboardMetrics['ticketsByStatus'] {
        const statusCounts: Record<TicketStatus, number> = {
            [TicketStatus.OPEN]: 0,
            [TicketStatus.IN_PROGRESS]: 0,
            [TicketStatus.PENDING_CUSTOMER]: 0,
            [TicketStatus.PENDING_VENDOR]: 0,
            [TicketStatus.RESOLVED]: 0,
            [TicketStatus.CLOSED]: 0,
            [TicketStatus.CANCELLED]: 0,
        };

        tickets.forEach(ticket => {
            statusCounts[ticket.status]++;
        });

        const totalTickets = tickets.length;

        return Object.entries(statusCounts)
            .filter(([_, count]) => count > 0)
            .map(([status, count]) => ({
                status: status as TicketStatus,
                count,
                percentage: totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0,
            }));
    }

    private calculateTicketsByCategory(tickets: Ticket[]): DashboardMetrics['ticketsByCategory'] {
        const categoryMap = new Map<string, { name: string; count: number }>();

        tickets.forEach(ticket => {
            if (ticket.category) {
                const existing = categoryMap.get(ticket.categoryId) || { name: ticket.category.name, count: 0 };
                existing.count++;
                categoryMap.set(ticket.categoryId, existing);
            }
        });

        const totalTickets = tickets.length;

        return Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
            categoryId,
            categoryName: data.name,
            count: data.count,
            percentage: totalTickets > 0 ? Math.round((data.count / totalTickets) * 100) : 0,
        }));
    }

    private calculateTicketsByPriority(tickets: Ticket[]): DashboardMetrics['ticketsByPriority'] {
        const priorityMap = new Map<string, number>();

        tickets.forEach(ticket => {
            const count = priorityMap.get(ticket.priority) || 0;
            priorityMap.set(ticket.priority, count + 1);
        });

        const totalTickets = tickets.length;

        return Array.from(priorityMap.entries()).map(([priority, count]) => ({
            priority,
            count,
            percentage: totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0,
        }));
    }

    private async calculateAgentPerformance(tickets: Ticket[], fromDate?: Date): Promise<DashboardMetrics['agentPerformance']> {
        const agentMap = new Map<string, {
            name: string;
            assignedTickets: number;
            resolvedTickets: number;
            resolutionTimes: number[];
            slaCompliantTickets: number;
        }>();

        tickets.forEach(ticket => {
            if (ticket.assignedAgent) {
                const agentId = ticket.assignedAgent.id;
                const existing = agentMap.get(agentId) || {
                    name: ticket.assignedAgent.fullName,
                    assignedTickets: 0,
                    resolvedTickets: 0,
                    resolutionTimes: [],
                    slaCompliantTickets: 0,
                };

                existing.assignedTickets++;

                if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
                    existing.resolvedTickets++;

                    if (ticket.resolvedAt && ticket.createdAt) {
                        const resolutionTime = (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
                        existing.resolutionTimes.push(resolutionTime);
                    }

                    if (ticket.resolutionSLAStatus === SLAStatus.ON_TIME) {
                        existing.slaCompliantTickets++;
                    }
                }

                agentMap.set(agentId, existing);
            }
        });

        return Array.from(agentMap.entries()).map(([agentId, data]) => ({
            agentId,
            agentName: data.name,
            assignedTickets: data.assignedTickets,
            resolvedTickets: data.resolvedTickets,
            averageResolutionTime: data.resolutionTimes.length > 0
                ? Math.round((data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length) * 100) / 100
                : 0,
            slaCompliance: data.resolvedTickets > 0
                ? Math.round((data.slaCompliantTickets / data.resolvedTickets) * 100)
                : 100,
        }));
    }

    private async calculateTimeSeriesData(fromDate?: Date, categoryId?: string, agentId?: string): Promise<DashboardMetrics['timeSeriesData']> {
        if (!fromDate) {
            fromDate = this.getDateFromPeriod('7d');
        }

        const query = this.ticketRepository.createQueryBuilder('ticket');

        let createdQuery = query.clone()
            .select('DATE(ticket.createdAt)', 'date')
            .addSelect('COUNT(*)', 'count')
            .where('ticket.createdAt >= :fromDate', { fromDate });

        let resolvedQuery = this.ticketRepository.createQueryBuilder('ticket')
            .select('DATE(ticket.resolvedAt)', 'date')
            .addSelect('COUNT(*)', 'count')
            .where('ticket.resolvedAt >= :fromDate', { fromDate })
            .andWhere('ticket.resolvedAt IS NOT NULL');

        let closedQuery = this.ticketRepository.createQueryBuilder('ticket')
            .select('DATE(ticket.updatedAt)', 'date')
            .addSelect('COUNT(*)', 'count')
            .where('ticket.updatedAt >= :fromDate', { fromDate })
            .andWhere('ticket.status = :status', { status: TicketStatus.CLOSED });

        if (categoryId) {
            createdQuery = createdQuery.andWhere('ticket.categoryId = :categoryId', { categoryId });
            resolvedQuery = resolvedQuery.andWhere('ticket.categoryId = :categoryId', { categoryId });
            closedQuery = closedQuery.andWhere('ticket.categoryId = :categoryId', { categoryId });
        }

        if (agentId) {
            createdQuery = createdQuery.andWhere('ticket.assignedAgentId = :agentId', { agentId });
            resolvedQuery = resolvedQuery.andWhere('ticket.assignedAgentId = :agentId', { agentId });
            closedQuery = closedQuery.andWhere('ticket.assignedAgentId = :agentId', { agentId });
        }

        const [createdResults, resolvedResults, closedResults] = await Promise.all([
            createdQuery.groupBy('DATE(ticket.createdAt)').orderBy('date', 'ASC').getRawMany(),
            resolvedQuery.groupBy('DATE(ticket.resolvedAt)').orderBy('date', 'ASC').getRawMany(),
            closedQuery.groupBy('DATE(ticket.updatedAt)').orderBy('date', 'ASC').getRawMany(),
        ]);

        // Crear un mapa de fechas con todas las métricas
        const dateMap = new Map<string, { created: number; resolved: number; closed: number }>();

        // Inicializar todas las fechas con 0
        const current = new Date(fromDate);
        const today = new Date();

        while (current <= today) {
            const dateStr = current.toISOString().split('T')[0];
            dateMap.set(dateStr, { created: 0, resolved: 0, closed: 0 });
            current.setDate(current.getDate() + 1);
        }

        // Rellenar datos reales
        createdResults.forEach(result => {
            const date = result.date;
            if (dateMap.has(date)) {
                dateMap.get(date)!.created = parseInt(result.count);
            }
        });

        resolvedResults.forEach(result => {
            const date = result.date;
            if (dateMap.has(date)) {
                dateMap.get(date)!.resolved = parseInt(result.count);
            }
        });

        closedResults.forEach(result => {
            const date = result.date;
            if (dateMap.has(date)) {
                dateMap.get(date)!.closed = parseInt(result.count);
            }
        });

        return Array.from(dateMap.entries()).map(([date, data]) => ({
            date,
            created: data.created,
            resolved: data.resolved,
            closed: data.closed,
        }));
    }

    private calculateSLAMetrics(tickets: Ticket[]): DashboardMetrics['slaMetrics'] {
        const firstResponseSLA = {
            total: tickets.length,
            onTime: tickets.filter(t => t.firstResponseSLAStatus === SLAStatus.ON_TIME).length,
            atRisk: tickets.filter(t => t.firstResponseSLAStatus === SLAStatus.AT_RISK).length,
            breached: tickets.filter(t => t.firstResponseSLAStatus === SLAStatus.BREACHED).length,
            compliance: 0,
        };

        const resolutionSLA = {
            total: tickets.length,
            onTime: tickets.filter(t => t.resolutionSLAStatus === SLAStatus.ON_TIME).length,
            atRisk: tickets.filter(t => t.resolutionSLAStatus === SLAStatus.AT_RISK).length,
            breached: tickets.filter(t => t.resolutionSLAStatus === SLAStatus.BREACHED).length,
            compliance: 0,
        };

        firstResponseSLA.compliance = firstResponseSLA.total > 0
            ? Math.round((firstResponseSLA.onTime / firstResponseSLA.total) * 100)
            : 100;

        resolutionSLA.compliance = resolutionSLA.total > 0
            ? Math.round((resolutionSLA.onTime / resolutionSLA.total) * 100)
            : 100;

        return {
            firstResponseSLA,
            resolutionSLA,
        };
    }

    async getTopCategories(limit: number = 5): Promise<Array<{
        categoryId: string;
        categoryName: string;
        ticketCount: number;
        avgResolutionTime: number;
        slaCompliance: number;
    }>> {
        const result = await this.ticketRepository
            .createQueryBuilder('ticket')
            .leftJoin('ticket.category', 'category')
            .select('ticket.categoryId', 'categoryId')
            .addSelect('category.name', 'categoryName')
            .addSelect('COUNT(*)', 'ticketCount')
            .addSelect('AVG(CASE WHEN ticket.resolvedAt IS NOT NULL THEN EXTRACT(EPOCH FROM (ticket.resolvedAt - ticket.createdAt))/3600 END)', 'avgResolutionTime')
            .addSelect('AVG(CASE WHEN ticket.resolutionSLAStatus = :onTime THEN 1 ELSE 0 END) * 100', 'slaCompliance')
            .setParameter('onTime', SLAStatus.ON_TIME)
            .groupBy('ticket.categoryId')
            .addGroupBy('category.name')
            .orderBy('ticketCount', 'DESC')
            .limit(limit)
            .getRawMany();

        return result.map(row => ({
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            ticketCount: parseInt(row.ticketCount),
            avgResolutionTime: parseFloat(row.avgResolutionTime) || 0,
            slaCompliance: parseFloat(row.slaCompliance) || 100,
        }));
    }
}