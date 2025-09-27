import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../../modules/audit/entities/audit-log.entity';

export const AUDIT_KEY = 'audit';
export const Audit = (action: AuditAction, entityType: string) =>
    SetMetadata(AUDIT_KEY, { action, entityType });