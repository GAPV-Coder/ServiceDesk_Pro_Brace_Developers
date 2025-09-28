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
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam,
    ApiBody,
    ApiBearerAuth,
    ApiProperty
} from '@nestjs/swagger';
import { TicketsService } from '../services/tickets.service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { User, UserRole } from '../../users/entities/user.entity';
import { TicketStatus, TicketPriority } from '../entities/ticket.entity';
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

// Las clases Swagger DTO se definen localmente para garantizar la compatibilidad con @nestjs/swagger para la documentación de la API,
// al tiempo que se mantiene la validación de tipos basada en Zod existente para garantizar la seguridad y la coherencia en tiempo de ejecución.

class CreateTicketDtoSwagger {
    @ApiProperty({ description: 'Ticket title', example: 'System issue', required: true })
    title: string;

    @ApiProperty({ description: 'Ticket description', example: 'Details of the problem...', required: true })
    description: string;

    @ApiProperty({ description: 'Category ID', example: 'category-uuid', required: true })
    categoryId: string;

    @ApiProperty({ enum: Object.values(TicketPriority), description: 'Prioridad del ticket', required: false })
    priority?: TicketPriority;

    @ApiProperty({ type: 'object', additionalProperties: true, description: 'Additional information' })
    additionalData?: Record<string, any>;
}

class UpdateTicketDtoSwagger {
    @ApiProperty({ description: 'Ticket title', example: 'System issue', required: false })
    title?: string;

    @ApiProperty({ description: 'Ticket description', example: 'Details of the problem...', required: false })
    description?: string;

    @ApiProperty({ enum: Object.values(TicketStatus), description: 'Ticket status', required: false })
    status?: TicketStatus;

    @ApiProperty({ enum: Object.values(TicketPriority), description: 'Ticket priority', required: false })
    priority?: TicketPriority;

    @ApiProperty({ description: 'Assigned agent ID', example: 'agent-uuid', required: false })
    assignedAgentId?: string;

    @ApiProperty({ type: 'object', additionalProperties: true, description: 'Additional information' })
    additionalData?: Record<string, any>;
}

class TicketCommentDtoSwagger {
    @ApiProperty({ description: 'Comment content', example: 'Comment on the ticket', required: true })
    content: string;

    @ApiProperty({ enum: ['public', 'internal'], description: 'Type of comment', example: 'public', required: false })
    type: 'public' | 'internal';
}

class AssignTicketDtoSwagger {
    @ApiProperty({ description: 'Agent ID', example: 'Agent-uuid', required: true })
    agentId: string;
}

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TicketsController {
    constructor(private ticketsService: TicketsService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve a list of all tickets' })
    @ApiResponse({ status: 200, description: 'List of tickets retrieved successfully' })
    async findAll(
        @Query(new ZodValidationPipe(TicketQuerySchema)) query: TicketQueryDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.findAll(query, user);
    }

    @Get('my-tickets')
    @ApiOperation({ summary: 'Retrieve current user\'s tickets' })
    @ApiQuery({ name: 'status', type: 'string', enum: Object.values(TicketStatus), required: false })
    @ApiResponse({ status: 200, description: 'User tickets retrieved successfully' })
    async getMyTickets(
        @CurrentUser() user: User,
        @Query('status') status?: TicketStatus,
    ) {
        return this.ticketsService.getMyTickets(user, status);
    }

    @Get('my-stats')
    @ApiOperation({ summary: 'Retrieve current user\'s ticket stats' })
    @ApiResponse({ status: 200, description: 'User ticket stats retrieved successfully' })
    async getMyStats(@CurrentUser() user: User) {
        return this.ticketsService.getTicketStats(user);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search for tickets by term' })
    @ApiQuery({ name: 'q', type: 'string', description: 'Search term' })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
    async searchTickets(
        @Query('q') searchTerm: string,
        @CurrentUser() user: User,
        @Query('limit') limit?: number,
    ) {
        return this.ticketsService.searchTickets(searchTerm, user, limit);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a single ticket by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Ticket UUID' })
    @ApiResponse({ status: 200, description: 'Ticket retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    async findOne(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.findById(params.id, user);
    }

    @Get(':id/comments')
    @ApiOperation({ summary: 'Retrieve comments for a ticket by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Ticket UUID' })
    @ApiResponse({ status: 200, description: 'Ticket comments retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    async getComments(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.getTicketComments(params.id, user);
    }

    @Post()
    @Audit(AuditAction.TICKET_CREATED, 'ticket')
    @ApiOperation({ summary: 'Create a new ticket' })
    @ApiBody({ type: CreateTicketDtoSwagger })
    @ApiResponse({ status: 201, description: 'Ticket created successfully' })
    async create(
        @Body(new ZodValidationPipe(CreateTicketSchema)) createTicketDto: CreateTicketDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.create(createTicketDto, user);
    }

    @Post(':id/comments')
    @Audit(AuditAction.TICKET_COMMENTED, 'ticket')
    @ApiOperation({ summary: 'Add a comment to a ticket' })
    @ApiParam({ name: 'id', type: 'string', description: 'Ticket UUID' })
    @ApiBody({ type: TicketCommentDtoSwagger })
    @ApiResponse({ status: 201, description: 'Comment added successfully' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    async addComment(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Body(new ZodValidationPipe(TicketCommentSchema)) commentDto: TicketCommentDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.addComment(params.id, commentDto, user);
    }

    @Put(':id')
    @Audit(AuditAction.TICKET_UPDATED, 'ticket')
    @ApiOperation({ summary: 'Update a ticket by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Ticket UUID' })
    @ApiBody({ type: UpdateTicketDtoSwagger })
    @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
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
    @ApiOperation({ summary: 'Assign a ticket to an agent' })
    @ApiParam({ name: 'id', type: 'string', description: 'Ticket UUID' })
    @ApiBody({ type: AssignTicketDtoSwagger })
    @ApiResponse({ status: 200, description: 'Ticket assigned successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
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
    @ApiOperation({ summary: 'Resolve a ticket' })
    @ApiParam({ name: 'id', type: 'string', description: 'Ticket UUID' })
    @ApiResponse({ status: 200, description: 'Ticket resolved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    async resolveTicket(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.resolveTicket(params.id, user);
    }

    @Patch(':id/close')
    @Audit(AuditAction.TICKET_STATUS_CHANGED, 'ticket')
    @ApiOperation({ summary: 'Close a ticket' })
    @ApiParam({ name: 'id', type: 'string', description: 'Ticket UUID' })
    @ApiResponse({ status: 200, description: 'Ticket closed successfully' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    async closeTicket(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.closeTicket(params.id, user);
    }

    @Patch(':id/reopen')
    @Audit(AuditAction.TICKET_STATUS_CHANGED, 'ticket')
    @ApiOperation({ summary: 'Reopen a ticket' })
    @ApiParam({ name: 'id', type: 'string', description: 'Ticket UUID' })
    @ApiResponse({ status: 200, description: 'Ticket reopened successfully' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    async reopenTicket(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @CurrentUser() user: User,
    ) {
        return this.ticketsService.reopenTicket(params.id, user);
    }

    @Patch('bulk/status')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.TICKET_UPDATED, 'ticket')
    @ApiOperation({ summary: 'Bulk update ticket statuses' })
    @ApiBody({ schema: { properties: { ticketIds: { type: 'array', items: { type: 'string' } }, status: { type: 'string', enum: Object.values(TicketStatus) } } } })
    @ApiResponse({ status: 200, description: 'Tickets updated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async bulkUpdateStatus(
        @Body('ticketIds') ticketIds: string[],
        @Body('status') status: TicketStatus,
        @CurrentUser() user: User,
    ) {
        await this.ticketsService.bulkUpdateStatus(ticketIds, status, user);
        return { message: 'Tickets updated successfully' };
    }
}