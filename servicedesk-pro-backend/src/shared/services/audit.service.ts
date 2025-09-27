import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../../modules/audit/entities/audit-log.entity';

export interface CreateAuditLogData {
    action: AuditAction;
    entityType: string;
    entityId: string;
    userId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    ticketId?: string;
}

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private auditRepository: Repository<AuditLog>,
    ) { }

    async createLog(data: CreateAuditLogData): Promise<AuditLog> {
        const auditLog = this.auditRepository.create(data);
        return this.auditRepository.save(auditLog);
    }

    async getEntityAuditLogs(entityType: string, entityId: string): Promise<AuditLog[]> {
        return this.auditRepository.find({
            where: { entityType, entityId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async getUserAuditLogs(userId: string, limit: number = 50): Promise<AuditLog[]> {
        return this.auditRepository.find({
            where: { userId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
}