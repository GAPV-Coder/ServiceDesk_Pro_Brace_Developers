import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import type { DashboardQueryDto } from '../dto/dashboard.schemas';
import { DashboardQuerySchema } from '../dto/dashboard.schemas';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER) // Solo managers pueden acceder al dashboard
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @Get('metrics')
    async getMetrics(@Query(new ZodValidationPipe(DashboardQuerySchema)) query: DashboardQueryDto) {
        return this.dashboardService.getDashboardMetrics(query);
    }

    @Get('top-categories')
    async getTopCategories(@Query('limit') limit?: number) {
        return this.dashboardService.getTopCategories(limit);
    }
}