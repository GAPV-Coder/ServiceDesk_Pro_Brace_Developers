import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AuditService } from '../services/audit.service';
import type { AuditQueryDto } from '../services/audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { UUIDParamSchema } from '../../../shared/dto/common.schemas';
import type { UUIDParamDto } from '../../../shared/dto/common.schemas';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER) // Solo managers pueden acceder a auditoría
export class AuditController {
    constructor(private auditService: AuditService) { }

    @Get()
    async findAll(@Query() query: AuditQueryDto) {
        return this.auditService.findAll(query);
    }

    @Get('stats')
    async getStats(@Query('days') days?: number) {
        return this.auditService.getAuditStats(days);
    }

    @Get('entity/:type/:id')
    async getEntityAuditTrail(
        @Param('type') entityType: string,
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
    ) {
        return this.auditService.getEntityAuditTrail(entityType, params.id);
    }

    @Get('user/:id')
    async getUserActivity(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Query('limit') limit?: number,
    ) {
        return this.auditService.getUserActivity(params.id, limit);
    }
}