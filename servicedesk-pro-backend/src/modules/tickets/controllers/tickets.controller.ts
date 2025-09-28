import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TicketsService } from '../services/tickets.service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { User, UserRole } from '../../users/entities/user.entity';
import { TicketStatus } from '../entities/ticket.entity';
import { AuditAction } from '../../audit/entities/audit-log.entity';
import {
    CreateTicketSchema,
    UpdateTicketSchema,
    TicketQuerySchema,
    TicketCommentSchema,
    AssignTicketSchema
} from '../dto/ticket.schemas';
import type {
    CreateTicketDto,
    UpdateTicketDto,
    TicketQueryDto,
    TicketCommentDto,
    AssignTicketDto
} from '../dto/ticket.schemas';
import { UUIDParamSchema } from '../../../shared/dto/common.schemas';
import type { UUIDParamDto } from '../../../shared/dto/common.schemas';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
    constructor(private ticketsService: TicketsService) { }

    @Get()
    async findAll(
        @Query(new ZodValidationPipe(TicketQuerySchema)) query: TicketQueryDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.findAll(query, user);
    }

    @Get('my-tickets')
    async getMyTickets(
        @CurrentUser() user: User,
        @Query('status') status?: TicketStatus,
    ) {
        return this.ticketsService.getMyTickets(user, status);
    }

    @Get('my-stats')
    async getMyStats(@CurrentUser() user: User) {
        return this.ticketsService.getTicketStats(user);
    }

    @Get('search')
    async searchTickets(
        @Query('q') searchTerm: string,
        @CurrentUser() user: User,
        @Query('limit') limit?: number,
    ) {
        return this.ticketsService.searchTickets(searchTerm, user, limit);
    }

    @Get(':id')
    async findOne(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.findById(params.id, user);
    }

    @Get(':id/comments')
    async getComments(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.getTicketComments(params.id, user);
    }

    @Post()
    @Audit(AuditAction.TICKET_CREATED, 'ticket')
    async create(
        @Body(new ZodValidationPipe(CreateTicketSchema)) createTicketDto: CreateTicketDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.create(createTicketDto, user);
    }

    @Post(':id/comments')
    @Audit(AuditAction.TICKET_COMMENTED, 'ticket')
    async addComment(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Body(new ZodValidationPipe(TicketCommentSchema)) commentDto: TicketCommentDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.addComment(params.id, commentDto, user);
    }

    @Put(':id')
    @Audit(AuditAction.TICKET_UPDATED, 'ticket')
    async update(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Body(new ZodValidationPipe(UpdateTicketSchema)) updateTicketDto: UpdateTicketDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.update(params.id, updateTicketDto, user);
    }

    @Patch(':id/assign')
    @Roles(UserRole.AGENT, UserRole.MANAGER)
    @Audit(AuditAction.TICKET_ASSIGNED, 'ticket')
    async assignTicket(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Body(new ZodValidationPipe(AssignTicketSchema)) assignDto: AssignTicketDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.assignTicket(params.id, assignDto, user);
    }

    @Patch(':id/resolve')
    @Roles(UserRole.AGENT, UserRole.MANAGER)
    @Audit(AuditAction.TICKET_STATUS_CHANGED, 'ticket')
    async resolveTicket(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.resolveTicket(params.id, user);
    }

    @Patch(':id/close')
    @Audit(AuditAction.TICKET_STATUS_CHANGED, 'ticket')
    async closeTicket(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.closeTicket(params.id, user);
    }

    @Patch(':id/reopen')
    @Audit(AuditAction.TICKET_STATUS_CHANGED, 'ticket')
    async reopenTicket(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.reopenTicket(params.id, user);
    }

    @Patch('bulk/status')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.TICKET_UPDATED, 'ticket')
    async bulkUpdateStatus(
        @Body('ticketIds') ticketIds: string[],
        @Body('status') status: TicketStatus,
        @CurrentUser() user: User,
    ) {
        await this.ticketsService.bulkUpdateStatus(ticketIds, status, user);
        return { message: 'Tickets updated successfully' };
    }
}