import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_KEY } from '../../shared/decorators/audit.decorator';
import { AuditService } from '../../shared/services/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(
        private reflector: Reflector,
        private auditService: AuditService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const auditConfig = this.reflector.get(AUDIT_KEY, context.getHandler());

        if (!auditConfig) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return next.handle();
        }

        return next.handle().pipe(
            tap(async (result) => {
                try {
                    await this.auditService.createLog({
                        action: auditConfig.action,
                        entityType: auditConfig.entityType,
                        entityId: result?.id || request.params?.id,
                        userId: user.id,
                        newValues: result,
                        ipAddress: request.ip,
                        userAgent: request.headers['user-agent'],
                        ticketId: auditConfig.entityType === 'ticket' ? result?.id : undefined,
                    });
                } catch (error) {
                    // Registrar el error, pero no rechazar la solicitud.
                    console.error('Audit log failed:', error);
                }
            }),
        );
    }
}