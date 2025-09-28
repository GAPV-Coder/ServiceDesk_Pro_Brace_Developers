import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import type { DashboardQueryDto } from '../dto/dashboard.schemas';
import { DashboardQuerySchema } from '../dto/dashboard.schemas';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER) // Solo managers pueden acceder al dashboard
@ApiBearerAuth()
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @Get('metrics')
    @ApiOperation({ summary: 'Retrieve dashboard metrics' })
    @ApiResponse({ status: 200, description: 'Dashboard metrics retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async getMetrics(@Query(new ZodValidationPipe(DashboardQuerySchema)) query: DashboardQueryDto) {
        return this.dashboardService.getDashboardMetrics(query);
    }

    @Get('top-categories')
    @ApiOperation({ summary: 'Retrieve top categories' })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiResponse({ status: 200, description: 'Top categories retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async getTopCategories(@Query('limit') limit?: number) {
        return this.dashboardService.getTopCategories(limit);
    }
}