import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import { PaginationUtil, PaginationResult } from '../../../shared/utils/pagination.util';
import { QueryUtil } from '../../../shared/utils/query.util';

export interface AuditQueryDto {
    page?: number;
    limit?: number;
    action?: AuditAction;
    entityType?: string;
    entityId?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
}

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private auditRepository: Repository<AuditLog>,
    ) { }

    async findAll(queryDto: AuditQueryDto): Promise<PaginationResult<AuditLog>> {
        const {
            page = 1,
            limit = 50,
            action,
            entityType,
            entityId,
            userId,
            dateFrom,
            dateTo
        } = queryDto;

        const query = this.auditRepository.createQueryBuilder('audit')
            .leftJoinAndSelect('audit.user', 'user')
            .leftJoinAndSelect('audit.ticket', 'ticket');

        // Aplicar filtros
        QueryUtil.applyEnumFilter(query, 'audit.action', action);
        QueryUtil.applyEnumFilter(query, 'audit.entityType', entityType);

        if (entityId) {
            query.andWhere('audit.entityId = :entityId', { entityId });
        }

        if (userId) {
            query.andWhere('audit.userId = :userId', { userId });
        }

        QueryUtil.applyDateRange(query, 'audit.createdAt', dateFrom, dateTo);

        // Contar total
        const totalItems = await query.getCount();

        // Aplicar paginación y ordenamiento
        query
            .orderBy('audit.createdAt', 'DESC')
            .skip(PaginationUtil.getSkip(page, limit))
            .take(limit);

        const auditLogs = await query.getMany();

        return PaginationUtil.createPaginationResult(auditLogs, totalItems, { page, limit });
    }

    async getEntityAuditTrail(entityType: string, entityId: string): Promise<AuditLog[]> {
        return this.auditRepository.find({
            where: { entityType, entityId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async getUserActivity(userId: string, limit: number = 100): Promise<AuditLog[]> {
        return this.auditRepository.find({
            where: { userId },
            relations: ['user', 'ticket'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async createLog(data: DeepPartial<AuditLog>): Promise<AuditLog> {
        const auditLog = this.auditRepository.create(data);
        return this.auditRepository.save(auditLog);
    }

    async getAuditStats(days: number = 30): Promise<{
        totalActions: number;
        actionBreakdown: Record<AuditAction, number>;
        topUsers: Array<{ userId: string; userName: string; actionCount: number }>;
        dailyActivity: Array<{ date: string; count: number }>;
    }> {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        // Total de acciones
        const totalActions = await this.auditRepository.count({
            where: { createdAt: fromDate as any }, // TypeORM se encargará de la comparación de fechas.
        });

        // Breakdown por acción
        const actionBreakdown: Record<AuditAction, number> = {} as any;
        const actions = Object.values(AuditAction);

        for (const action of actions) {
            const count = await this.auditRepository.count({
                where: { action, createdAt: fromDate as any },
            });
            actionBreakdown[action] = count;
        }

        // Top usuarios más activos
        const topUsersResult = await this.auditRepository
            .createQueryBuilder('audit')
            .leftJoin('audit.user', 'user')
            .select('audit.userId', 'userId')
            .addSelect('user.firstName', 'firstName')
            .addSelect('user.lastName', 'lastName')
            .addSelect('COUNT(*)', 'actionCount')
            .where('audit.createdAt >= :fromDate', { fromDate })
            .groupBy('audit.userId')
            .addGroupBy('user.firstName')
            .addGroupBy('user.lastName')
            .orderBy('actionCount', 'DESC')
            .limit(10)
            .getRawMany();

        const topUsers = topUsersResult.map(result => ({
            userId: result.userId,
            userName: `${result.firstName} ${result.lastName}`,
            actionCount: parseInt(result.actionCount),
        }));

        // Actividad diaria
        const dailyActivityResult = await this.auditRepository
            .createQueryBuilder('audit')
            .select('DATE(audit.createdAt)', 'date')
            .addSelect('COUNT(*)', 'count')
            .where('audit.createdAt >= :fromDate', { fromDate })
            .groupBy('DATE(audit.createdAt)')
            .orderBy('date', 'ASC')
            .getRawMany();

        const dailyActivity = dailyActivityResult.map(result => ({
            date: result.date,
            count: parseInt(result.count),
        }));

        return {
            totalActions,
            actionBreakdown,
            topUsers,
            dailyActivity,
        };
    }
}