import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditService } from '../services/audit.service';
import type { AuditQueryDto } from '../services/audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { UUIDParamSchema } from '../../../shared/dto/common.schemas';
import type { UUIDParamDto } from '../../../shared/dto/common.schemas';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER) // Solo managers pueden acceder a auditoría
@ApiBearerAuth()
export class AuditController {
    constructor(private auditService: AuditService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve all audit logs' })
    @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async findAll(@Query() query: AuditQueryDto) {
        return this.auditService.findAll(query);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Retrieve audit stats' })
    @ApiQuery({ name: 'days', type: 'number', required: false })
    @ApiResponse({ status: 200, description: 'Audit stats retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async getStats(@Query('days') days?: number) {
        return this.auditService.getAuditStats(days);
    }

    @Get('entity/:type/:id')
    @ApiOperation({ summary: 'Retrieve audit trail for an entity' })
    @ApiParam({ name: 'type', type: 'string', description: 'Entity type' })
    @ApiParam({ name: 'id', type: 'string', description: 'Entity UUID' })
    @ApiResponse({ status: 200, description: 'Entity audit trail retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Entity not found' })
    async getEntityAuditTrail(
        @Param('type') entityType: string,
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
    ) {
        return this.auditService.getEntityAuditTrail(entityType, params.id);
    }

    @Get('user/:id')
    @ApiOperation({ summary: 'Retrieve user activity' })
    @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiResponse({ status: 200, description: 'User activity retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserActivity(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Query('limit') limit?: number,
    ) {
        return this.auditService.getUserActivity(params.id, limit);
    }
}