import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Inject
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, SLAStatus } from '../entities/ticket.entity';
import { TicketComment, CommentType } from '../entities/ticket-comment.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { CategoriesService } from '../../categories/services/categories.service';
import { TicketNumberService } from '../../../shared/services/ticket-number.service';
import { SLAService } from '../../../shared/services/sla.service';
import { PaginationUtil, PaginationResult } from '../../../shared/utils/pagination.util';
import { QueryUtil } from '../../../shared/utils/query.util';
import { EventEmitter2 } from 'eventemitter2';
import {
    CreateTicketDto,
    UpdateTicketDto,
    TicketQueryDto,
    TicketCommentDto,
    AssignTicketDto
} from '../dto/ticket.schemas';

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
        @InjectRepository(TicketComment)
        private commentRepository: Repository<TicketComment>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private categoriesService: CategoriesService,
        private ticketNumberService: TicketNumberService,
        private slaService: SLAService,
        @Inject('EventEmitter2') private eventEmitter: EventEmitter2,
    ) { }

    async findAll(queryDto: TicketQueryDto, currentUser: User): Promise<PaginationResult<Ticket>> {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            priority,
            categoryId,
            assignedAgentId,
            requesterId,
            slaStatus,
            dateFrom,
            dateTo
        } = queryDto;

        const query = this.ticketRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.requester', 'requester')
            .leftJoinAndSelect('ticket.assignedAgent', 'assignedAgent')
            .leftJoinAndSelect('ticket.category', 'category');

        // Aplicar filtros de seguridad por rol
        if (currentUser.role === UserRole.REQUESTER) {
            // Los requesters solo ven sus propios tickets
            query.andWhere('ticket.requesterId = :userId', { userId: currentUser.id });
        } else if (currentUser.role === UserRole.AGENT) {
            // Los agents ven tickets asignados a ellos o sin asignar
            query.andWhere(
                '(ticket.assignedAgentId = :userId OR ticket.assignedAgentId IS NULL)',
                { userId: currentUser.id }
            );
        }
        // Los managers ven todos los tickets

        // Aplicar filtros de búsqueda
        if (search) {
            QueryUtil.applyTextSearch(query, search, [
                'ticket.ticketNumber',
                'ticket.title',
                'ticket.description',
                'requester.firstName',
                'requester.lastName',
                'requester.email'
            ]);
        }

        // Aplicar filtros específicos
        QueryUtil.applyEnumFilter(query, 'ticket.status', status);
        QueryUtil.applyEnumFilter(query, 'ticket.priority', priority);
        QueryUtil.applyEnumFilter(query, 'ticket.firstResponseSLAStatus', slaStatus);
        QueryUtil.applyEnumFilter(query, 'ticket.resolutionSLAStatus', slaStatus);

        if (categoryId) {
            query.andWhere('ticket.categoryId = :categoryId', { categoryId });
        }

        if (assignedAgentId) {
            query.andWhere('ticket.assignedAgentId = :assignedAgentId', { assignedAgentId });
        }

        if (requesterId && currentUser.role !== UserRole.REQUESTER) {
            query.andWhere('ticket.requesterId = :requesterId', { requesterId });
        }

        // Aplicar filtros de fecha
        QueryUtil.applyDateRange(query, 'ticket.createdAt', dateFrom, dateTo);

        // Contar total
        const totalItems = await query.getCount();

        // Aplicar paginación y ordenamiento
        query
            .orderBy('ticket.createdAt', 'DESC')
            .skip(PaginationUtil.getSkip(page, limit))
            .take(limit);

        const tickets = await query.getMany();

        // Actualizar SLA status de los tickets
        await this.updateTicketsSLAStatus(tickets);

        return PaginationUtil.createPaginationResult(tickets, totalItems, { page, limit });
    }

    async findById(id: string, currentUser: User): Promise<Ticket> {
        const query = this.ticketRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.requester', 'requester')
            .leftJoinAndSelect('ticket.assignedAgent', 'assignedAgent')
            .leftJoinAndSelect('ticket.category', 'category')
            .leftJoinAndSelect('ticket.comments', 'comments')
            .leftJoinAndSelect('comments.author', 'commentAuthor')
            .where('ticket.id = :id', { id });

        // Aplicar filtros de seguridad por rol
        if (currentUser.role === UserRole.REQUESTER) {
            query.andWhere('ticket.requesterId = :userId', { userId: currentUser.id });
        } else if (currentUser.role === UserRole.AGENT) {
            query.andWhere(
                '(ticket.assignedAgentId = :userId OR ticket.assignedAgentId IS NULL)',
                { userId: currentUser.id }
            );
        }

        const ticket = await query.getOne();

        if (!ticket) {
            throw new NotFoundException(`Ticket with ID ${id} not found or access denied`);
        }

        // Actualizar SLA status
        this.slaService.updateTicketSLAStatus(ticket);
        await this.ticketRepository.save(ticket);

        return ticket;
    }

    async create(createTicketDto: CreateTicketDto, currentUser: User): Promise<Ticket> {
        const { categoryId, title, description, priority, additionalData } = createTicketDto;

        // Obtener categoría y validar
        const category = await this.categoriesService.findById(categoryId);
        if (!category.isActive) {
            throw new BadRequestException('Selected category is not active');
        }

        // Validar datos adicionales según la categoría
        const validation = await this.categoriesService.validateCategoryFieldData(
            categoryId,
            additionalData
        );

        if (!validation.isValid) {
            throw new BadRequestException({
                message: 'Category field validation failed',
                errors: validation.errors,
            });
        }

        // Generar número de ticket único
        let ticketNumber: string;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            ticketNumber = this.ticketNumberService.generateTicketNumber();
            attempts++;

            if (attempts > maxAttempts) {
                throw new Error('Could not generate unique ticket number');
            }
        } while (await this.ticketRepository.findOne({ where: { ticketNumber } }));

        // Calcular fechas de SLA
        const now = new Date();
        const slaDeadlines = category.calculateSLADates(now);

        // Crear snapshot de la categoría
        const categorySnapshot = {
            id: category.id,
            name: category.name,
            sla: category.sla,
            additionalFields: category.additionalFields,
        };

        // Crear ticket
        const ticket = this.ticketRepository.create({
            ticketNumber,
            title,
            description,
            priority,
            requesterId: currentUser.id,
            categoryId,
            additionalData: additionalData || {},
            firstResponseDue: slaDeadlines.firstResponseDue,
            resolutionDue: slaDeadlines.resolutionDue,
            categorySnapshot,
            status: TicketStatus.OPEN,
            firstResponseSLAStatus: SLAStatus.ON_TIME,
            resolutionSLAStatus: SLAStatus.ON_TIME,
        });

        const savedTicket = await this.ticketRepository.save(ticket);

        // Emitir evento para notificaciones
        this.eventEmitter.emit('ticket.created', {
            ticket: savedTicket,
            user: currentUser,
        });

        return this.findById(savedTicket.id, currentUser);
    }

    async update(id: string, updateTicketDto: UpdateTicketDto, currentUser: User): Promise<Ticket> {
        const ticket = await this.findById(id, currentUser);

        // Verificar permisos de edición
        if (currentUser.role === UserRole.REQUESTER && ticket.requesterId !== currentUser.id) {
            throw new ForbiddenException('You can only edit your own tickets');
        }

        // Los requesters solo pueden editar ciertos campos
        if (currentUser.role === UserRole.REQUESTER) {
            const allowedFields = ['title', 'description', 'additionalData'];
            const providedFields = Object.keys(updateTicketDto);
            const forbiddenFields = providedFields.filter(field => !allowedFields.includes(field));

            if (forbiddenFields.length > 0) {
                throw new ForbiddenException(
                    `Requesters cannot modify these fields: ${forbiddenFields.join(', ')}`
                );
            }
        }

        // Validar transiciones de estado
        if (updateTicketDto.status && updateTicketDto.status !== ticket.status) {
            this.validateStatusTransition(ticket.status, updateTicketDto.status, currentUser.role);
        }

        // Validar datos adicionales si se están actualizando
        if (updateTicketDto.additionalData) {
            const validation = await this.categoriesService.validateCategoryFieldData(
                ticket.categoryId,
                updateTicketDto.additionalData
            );

            if (!validation.isValid) {
                throw new BadRequestException({
                    message: 'Category field validation failed',
                    errors: validation.errors,
                });
            }
        }

        // Verificar si el agente existe y puede ser asignado
        if (updateTicketDto.assignedAgentId) {
            const agent = await this.userRepository.findOne({
                where: { id: updateTicketDto.assignedAgentId }
            });

            if (!agent || !agent.canManageTickets()) {
                throw new BadRequestException('Invalid agent assignment');
            }
        }

        // Guardar valores anteriores para auditoría
        const oldValues = { ...ticket };

        // Aplicar actualizaciones
        Object.assign(ticket, updateTicketDto);

        // Manejar cambios especiales
        if (updateTicketDto.status) {
            await this.handleStatusChange(ticket, updateTicketDto.status, currentUser);
        }

        // Actualizar SLA status
        this.slaService.updateTicketSLAStatus(ticket);

        const updatedTicket = await this.ticketRepository.save(ticket);

        // Emitir evento de actualización
        this.eventEmitter.emit('ticket.updated', {
            ticket: updatedTicket,
            oldValues,
            user: currentUser,
        });

        return this.findById(updatedTicket.id, currentUser);
    }

    async assignTicket(id: string, assignDto: AssignTicketDto, currentUser: User): Promise<Ticket> {
        const ticket = await this.findById(id, currentUser);

        // Solo agents y managers pueden asignar tickets
        if (!currentUser.canManageTickets()) {
            throw new ForbiddenException('Only agents and managers can assign tickets');
        }

        // Verificar que el ticket pueda ser asignado
        if (!ticket.canBeAssigned()) {
            throw new BadRequestException('Ticket cannot be assigned in its current state');
        }

        // Verificar que el agente existe y puede manejar tickets
        const agent = await this.userRepository.findOne({
            where: { id: assignDto.agentId }
        });

        if (!agent || !agent.canManageTickets()) {
            throw new BadRequestException('Invalid agent for assignment');
        }

        ticket.assignedAgentId = assignDto.agentId;
        ticket.status = TicketStatus.IN_PROGRESS;

        const updatedTicket = await this.ticketRepository.save(ticket);

        // Crear comentario del sistema
        await this.addSystemComment(
            ticket.id,
            `Ticket assigned to ${agent.fullName}`,
            currentUser.id
        );

        // Emitir evento
        this.eventEmitter.emit('ticket.assigned', {
            ticket: updatedTicket,
            agent,
            assignedBy: currentUser,
        });

        return this.findById(updatedTicket.id, currentUser);
    }

    async addComment(id: string, commentDto: TicketCommentDto, currentUser: User): Promise<TicketComment> {
        const ticket = await this.findById(id, currentUser);
        const { content, type = CommentType.PUBLIC } = commentDto;

        // Los requesters solo pueden hacer comentarios públicos
        if (currentUser.role === UserRole.REQUESTER && type === CommentType.INTERNAL) {
            throw new ForbiddenException('Requesters cannot create internal comments');
        }

        // Verificar si es la primera respuesta
        const existingComments = await this.commentRepository.count({
            where: { ticketId: id, type: CommentType.PUBLIC }
        });

        const isFirstResponse = existingComments === 0 && currentUser.canManageTickets();

        // Forzar el tipo a CommentType para evitar incompatibilidades con sobrecargas de create()
        const partial: Partial<TicketComment> = {
            content,
            type: type as CommentType,
            ticketId: id,
            authorId: currentUser.id,
            isFirstResponse,
        };

        const comment = this.commentRepository.create(partial);
        const savedComment = await this.commentRepository.save(comment);

        // Si es la primera respuesta, actualizar el ticket
        if (isFirstResponse && !ticket.firstResponseAt) {
            ticket.firstResponseAt = new Date();
            this.slaService.updateTicketSLAStatus(ticket);
            await this.ticketRepository.save(ticket);

            // Emitir evento de primera respuesta
            this.eventEmitter.emit('ticket.first.response', {
                ticket,
                comment: savedComment,
                user: currentUser,
            });
        }

        // Emitir evento de comentario
        this.eventEmitter.emit('ticket.commented', {
            ticket,
            comment: savedComment,
            user: currentUser,
        });

        // findOneOrFail para evitar el tipo 'TicketComment | null'
        return this.commentRepository.findOneOrFail({
            where: { id: savedComment.id },
            relations: ['author'],
        });
    }

    async getTicketComments(id: string, currentUser: User): Promise<TicketComment[]> {
        const ticket = await this.findById(id, currentUser);

        const query = this.commentRepository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.author', 'author')
            .where('comment.ticketId = :ticketId', { ticketId: id });

        // Los requesters solo ven comentarios públicos
        if (currentUser.role === UserRole.REQUESTER) {
            query.andWhere('comment.type = :type', { type: CommentType.PUBLIC });
        }

        return query
            .orderBy('comment.createdAt', 'ASC')
            .getMany();
    }

    async resolveTicket(id: string, currentUser: User): Promise<Ticket> {
        const ticket = await this.findById(id, currentUser);

        // Solo agents y managers pueden resolver tickets
        if (!currentUser.canManageTickets()) {
            throw new ForbiddenException('Only agents and managers can resolve tickets');
        }

        // Verificar que el ticket puede ser resuelto
        if (!ticket.canBeResolved()) {
            throw new BadRequestException('Ticket cannot be resolved in its current state');
        }

        ticket.status = TicketStatus.RESOLVED;
        ticket.resolvedAt = new Date();

        // Actualizar SLA status
        this.slaService.updateTicketSLAStatus(ticket);

        const updatedTicket = await this.ticketRepository.save(ticket);

        // Crear comentario del sistema
        await this.addSystemComment(
            ticket.id,
            `Ticket resolved by ${currentUser.fullName}`,
            currentUser.id
        );

        // Emitir evento
        this.eventEmitter.emit('ticket.resolved', {
            ticket: updatedTicket,
            user: currentUser,
        });

        return this.findById(updatedTicket.id, currentUser);
    }

    async closeTicket(id: string, currentUser: User): Promise<Ticket> {
        const ticket = await this.findById(id, currentUser);

        // Solo se pueden cerrar tickets resueltos
        if (ticket.status !== TicketStatus.RESOLVED) {
            throw new BadRequestException('Only resolved tickets can be closed');
        }

        // Los requesters pueden cerrar sus propios tickets, agents/managers pueden cerrar cualquiera
        if (currentUser.role === UserRole.REQUESTER && ticket.requesterId !== currentUser.id) {
            throw new ForbiddenException('You can only close your own tickets');
        }

        ticket.status = TicketStatus.CLOSED;
        const updatedTicket = await this.ticketRepository.save(ticket);

        // Crear comentario del sistema
        await this.addSystemComment(
            ticket.id,
            `Ticket closed by ${currentUser.fullName}`,
            currentUser.id
        );

        // Emitir evento
        this.eventEmitter.emit('ticket.closed', {
            ticket: updatedTicket,
            user: currentUser,
        });

        return this.findById(updatedTicket.id, currentUser);
    }

    async reopenTicket(id: string, currentUser: User): Promise<Ticket> {
        const ticket = await this.findById(id, currentUser);

        // Solo se pueden reabrir tickets cerrados
        if (ticket.status !== TicketStatus.CLOSED) {
            throw new BadRequestException('Only closed tickets can be reopened');
        }

        // Los requesters pueden reabrir sus propios tickets, agents/managers pueden reabrir cualquiera
        if (currentUser.role === UserRole.REQUESTER && ticket.requesterId !== currentUser.id) {
            throw new ForbiddenException('You can only reopen your own tickets');
        }

        ticket.status = TicketStatus.OPEN;
        ticket.resolvedAt = null;

        // Recalcular SLA si es necesario
        this.slaService.updateTicketSLAStatus(ticket);

        const updatedTicket = await this.ticketRepository.save(ticket);

        // Crear comentario del sistema
        await this.addSystemComment(
            ticket.id,
            `Ticket reopened by ${currentUser.fullName}`,
            currentUser.id
        );

        // Emitir evento
        this.eventEmitter.emit('ticket.reopened', {
            ticket: updatedTicket,
            user: currentUser,
        });

        return this.findById(updatedTicket.id, currentUser);
    }

    async getMyTickets(currentUser: User, status?: TicketStatus): Promise<Ticket[]> {
        const query = this.ticketRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.category', 'category')
            .leftJoinAndSelect('ticket.assignedAgent', 'assignedAgent');

        if (currentUser.role === UserRole.REQUESTER) {
            query.where('ticket.requesterId = :userId', { userId: currentUser.id });
        } else if (currentUser.canManageTickets()) {
            query.where('ticket.assignedAgentId = :userId', { userId: currentUser.id });
        }

        if (status) {
            query.andWhere('ticket.status = :status', { status });
        }

        const tickets = await query
            .orderBy('ticket.createdAt', 'DESC')
            .getMany();

        // Actualizar SLA status
        await this.updateTicketsSLAStatus(tickets);

        return tickets;
    }

    async getTicketStats(currentUser: User): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
        slaBreached: number;
        slaAtRisk: number;
    }> {
        const tickets = await this.getMyTickets(currentUser);

        return {
            total: tickets.length,
            open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
            inProgress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
            resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
            closed: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
            slaBreached: tickets.filter(t =>
                t.firstResponseSLAStatus === SLAStatus.BREACHED ||
                t.resolutionSLAStatus === SLAStatus.BREACHED
            ).length,
            slaAtRisk: tickets.filter(t =>
                t.firstResponseSLAStatus === SLAStatus.AT_RISK ||
                t.resolutionSLAStatus === SLAStatus.AT_RISK
            ).length,
        };
    }

    private async updateTicketsSLAStatus(tickets: Ticket[]): Promise<void> {
        const ticketsToUpdate: Ticket[] = [];

        for (const ticket of tickets) {
            const originalFirstResponse = ticket.firstResponseSLAStatus;
            const originalResolution = ticket.resolutionSLAStatus;

            this.slaService.updateTicketSLAStatus(ticket);

            // Solo actualizar si cambió el status
            if (
                ticket.firstResponseSLAStatus !== originalFirstResponse ||
                ticket.resolutionSLAStatus !== originalResolution
            ) {
                ticketsToUpdate.push(ticket);
            }
        }

        if (ticketsToUpdate.length > 0) {
            await this.ticketRepository.save(ticketsToUpdate);
        }
    }

    private async addSystemComment(ticketId: string, content: string, userId: string): Promise<void> {
        const comment = this.commentRepository.create({
            content,
            type: CommentType.SYSTEM,
            ticketId,
            authorId: userId,
        });

        await this.commentRepository.save(comment);
    }

    private validateStatusTransition(currentStatus: TicketStatus, newStatus: TicketStatus, userRole: UserRole): void {
        const validTransitions: Record<TicketStatus, TicketStatus[]> = {
            [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
            [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED, TicketStatus.PENDING_CUSTOMER, TicketStatus.PENDING_VENDOR, TicketStatus.CANCELLED],
            [TicketStatus.PENDING_CUSTOMER]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
            [TicketStatus.PENDING_VENDOR]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
            [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
            [TicketStatus.CLOSED]: [TicketStatus.OPEN],
            [TicketStatus.CANCELLED]: [],
        };

        const allowedTransitions = validTransitions[currentStatus] || [];

        if (!allowedTransitions.includes(newStatus)) {
            throw new BadRequestException(
                `Invalid status transition from ${currentStatus} to ${newStatus}`
            );
        }

        // Los requesters no pueden cancelar tickets directamente
        if (userRole === UserRole.REQUESTER && newStatus === TicketStatus.CANCELLED) {
            throw new ForbiddenException('Requesters cannot cancel tickets directly');
        }
    }

    private async handleStatusChange(ticket: Ticket, newStatus: TicketStatus, currentUser: User): Promise<void> {
        switch (newStatus) {
            case TicketStatus.RESOLVED:
                if (!ticket.resolvedAt) {
                    ticket.resolvedAt = new Date();
                }
                break;
            case TicketStatus.IN_PROGRESS:
                // Si se vuelve a in_progress desde resolved, limpiar resolvedAt
                if (ticket.status === TicketStatus.RESOLVED) {
                    ticket.resolvedAt = null;
                }
                break;
            case TicketStatus.OPEN:
                // Si se reabre desde closed, limpiar resolvedAt
                if (ticket.status === TicketStatus.CLOSED) {
                    ticket.resolvedAt = null;
                }
                break;
        }
    }

    async bulkUpdateStatus(ticketIds: string[], status: TicketStatus, currentUser: User): Promise<void> {
        // Solo managers pueden hacer updates en bulk
        if (currentUser.role !== UserRole.MANAGER) {
            throw new ForbiddenException('Only managers can perform bulk updates');
        }

        // Validar que todos los tickets existen y están accesibles
        const tickets = await this.ticketRepository.findByIds(ticketIds);

        if (tickets.length !== ticketIds.length) {
            throw new BadRequestException('Some tickets were not found');
        }

        // Validar transiciones para cada ticket
        for (const ticket of tickets) {
            this.validateStatusTransition(ticket.status, status, currentUser.role);
        }

        // Actualizar todos los tickets
        await this.ticketRepository.update(ticketIds, { status });

        // Emitir evento de bulk update
        this.eventEmitter.emit('tickets.bulk.updated', {
            ticketIds,
            status,
            user: currentUser,
        });
    }

    async searchTickets(searchTerm: string, currentUser: User, limit: number = 20): Promise<Ticket[]> {
        const query = this.ticketRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.requester', 'requester')
            .leftJoinAndSelect('ticket.category', 'category');

        // Aplicar filtros de seguridad por rol
        if (currentUser.role === UserRole.REQUESTER) {
            query.where('ticket.requesterId = :userId', { userId: currentUser.id });
        } else if (currentUser.role === UserRole.AGENT) {
            query.where(
                '(ticket.assignedAgentId = :userId OR ticket.assignedAgentId IS NULL)',
                { userId: currentUser.id }
            );
        }

        QueryUtil.applyTextSearch(query, searchTerm, [
            'ticket.ticketNumber',
            'ticket.title',
            'ticket.description'
        ]);

        const tickets = await query
            .orderBy('ticket.createdAt', 'DESC')
            .take(limit)
            .getMany();

        await this.updateTicketsSLAStatus(tickets);

        return tickets;
    }
}