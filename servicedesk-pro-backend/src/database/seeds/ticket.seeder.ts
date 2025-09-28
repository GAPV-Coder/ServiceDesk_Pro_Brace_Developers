import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority, SLAStatus } from '../../modules/tickets/entities/ticket.entity';
import { TicketComment, CommentType } from '../../modules/tickets/entities/ticket-comment.entity';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { TicketNumberService } from '../../shared/services/ticket-number.service';

@Injectable()
export class TicketSeeder {
    constructor(
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
        @InjectRepository(TicketComment)
        private commentRepository: Repository<TicketComment>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        private ticketNumberService: TicketNumberService,
    ) { }

    async seed(): Promise<void> {
        // Verificar si ya existen tickets
        const existingTickets = await this.ticketRepository.count();
        if (existingTickets > 0) {
            console.log('Tickets already exist, skipping seeding');
            return;
        }

        // Obtener usuarios y categorías
        const requesters = await this.userRepository.find({ where: { role: UserRole.REQUESTER } });
        const agents = await this.userRepository.find({ where: { role: UserRole.AGENT } });
        const categories = await this.categoryRepository.find();

        if (requesters.length === 0 || categories.length === 0) {
            console.log('No requesters or categories found, skipping ticket seeding');
            return;
        }

        const ticketTemplates = [
            {
                title: 'Laptop screen flickering constantly',
                description: 'My laptop screen started flickering this morning and it\'s making it impossible to work. The flickering happens every few seconds and covers the entire screen.',
                priority: TicketPriority.HIGH,
                status: TicketStatus.OPEN,
                categoryName: 'Hardware Issues',
                additionalData: {
                    hardwareType: 'Laptop',
                    errorDetails: 'Screen flickering started suddenly this morning, happens every 3-5 seconds, covers entire display',
                    assetTag: 'LT0234',
                },
                daysAgo: 1,
            },
            {
                title: 'Cannot access Slack application',
                description: 'Slack won\'t start on my computer. I get an error message saying "Failed to load application".',
                priority: TicketPriority.MEDIUM,
                status: TicketStatus.IN_PROGRESS,
                categoryName: 'Software Issues',
                additionalData: {
                    softwareName: 'Slack',
                    softwareVersion: '4.29.149',
                    errorMessage: 'Failed to load application',
                    businessImpact: 'Medium - Reduced productivity',
                },
                daysAgo: 3,
            },
            {
                title: 'WiFi keeps disconnecting in conference room',
                description: 'The WiFi connection in Conference Room B keeps dropping every 10-15 minutes during meetings.',
                priority: TicketPriority.HIGH,
                status: TicketStatus.RESOLVED,
                categoryName: 'Network & Connectivity',
                additionalData: {
                    connectionType: 'WiFi',
                    location: 'Conference Room B',
                    devicesAffected: 8,
                },
                daysAgo: 5,
            },
            {
                title: 'Need access to new project repository',
                description: 'I need read/write access to the new project repository for the customer portal redesign.',
                priority: TicketPriority.MEDIUM,
                status: TicketStatus.RESOLVED,
                categoryName: 'Development Support',
                additionalData: {
                    requestType: 'Repository Access',
                    repositoryUrl: 'https://github.com/company/customer-portal',
                    environment: 'Development',
                    urgencyReason: 'Project starts Monday',
                },
                daysAgo: 7,
            },
            {
                title: 'Password reset for new employee',
                description: 'New employee Sarah Wilson needs her password reset and access to company systems.',
                priority: TicketPriority.MEDIUM,
                status: TicketStatus.CLOSED,
                categoryName: 'Account & Access',
                additionalData: {
                    accountType: 'New User Account',
                    systemsNeeded: 'Email, Slack, Project Management Tool, File Server',
                    managerApproval: true,
                    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                },
                daysAgo: 10,
            },
            {
                title: 'Printer not responding to print jobs',
                description: 'The main office printer is not responding to print jobs. The queue shows jobs as pending but nothing prints.',
                priority: TicketPriority.MEDIUM,
                status: TicketStatus.IN_PROGRESS,
                categoryName: 'Hardware Issues',
                additionalData: {
                    hardwareType: 'Printer',
                    errorDetails: 'Print jobs queue but never print, no error messages displayed',
                    assetTag: 'PR0105',
                },
                daysAgo: 2,
            },
            {
                title: 'VPN connection keeps timing out',
                description: 'My VPN connection times out after about 30 minutes of inactivity. This is disrupting my work when I step away briefly.',
                priority: TicketPriority.MEDIUM,
                status: TicketStatus.OPEN,
                categoryName: 'Network & Connectivity',
                additionalData: {
                    connectionType: 'VPN',
                    location: 'Home Office',
                    devicesAffected: 1,
                },
                daysAgo: 1,
            },
            {
                title: 'Excel crashes when opening large files',
                description: 'Microsoft Excel crashes consistently when trying to open files larger than 50MB.',
                priority: TicketPriority.LOW,
                status: TicketStatus.OPEN,
                categoryName: 'Software Issues',
                additionalData: {
                    softwareName: 'Microsoft Excel',
                    softwareVersion: '2021',
                    errorMessage: 'Excel has stopped working',
                    businessImpact: 'Low - Can work around',
                },
                daysAgo: 4,
            },
        ];

        const tickets: Ticket[] = [];

        for (const template of ticketTemplates) {
            // Encontrar la categoría
            const category = categories.find(c => c.name === template.categoryName);
            if (!category) continue;

            // Seleccionar requester aleatorio
            const requester = requesters[Math.floor(Math.random() * requesters.length)];

            // Seleccionar agente aleatorio (para tickets que no sean OPEN)
            const agent = template.status !== TicketStatus.OPEN
                ? agents[Math.floor(Math.random() * agents.length)]
                : undefined;

            // Calcular fechas
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - template.daysAgo);

            const slaDeadlines = category.calculateSLADates(createdAt);

            // Simular fechas de respuesta y resolución para tickets ya trabajados
            let firstResponseAt: Date | null = null;
            let resolvedAt: Date | null = null;

            if (template.status !== TicketStatus.OPEN) {
                // Primera respuesta (1-3 horas después de creación)
                firstResponseAt = new Date(createdAt);
                firstResponseAt.setHours(firstResponseAt.getHours() + Math.floor(Math.random() * 3) + 1);
            }

            if (template.status === TicketStatus.RESOLVED || template.status === TicketStatus.CLOSED) {
                // Resolución (4-20 horas después de creación)
                resolvedAt = new Date(createdAt);
                resolvedAt.setHours(resolvedAt.getHours() + Math.floor(Math.random() * 16) + 4);
            }

            // Calcular SLA status
            let firstResponseSLAStatus = SLAStatus.ON_TIME;
            let resolutionSLAStatus = SLAStatus.ON_TIME;

            if (firstResponseAt) {
                firstResponseSLAStatus = firstResponseAt <= slaDeadlines.firstResponseDue
                    ? SLAStatus.ON_TIME
                    : SLAStatus.BREACHED;
            } else {
                // Ticket aún abierto, verificar si está en riesgo
                const now = new Date();
                if (now > slaDeadlines.firstResponseDue) {
                    firstResponseSLAStatus = SLAStatus.BREACHED;
                } else {
                    const hoursToSLA = (slaDeadlines.firstResponseDue.getTime() - now.getTime()) / (1000 * 60 * 60);
                    firstResponseSLAStatus = hoursToSLA <= 2 ? SLAStatus.AT_RISK : SLAStatus.ON_TIME;
                }
            }

            if (resolvedAt) {
                resolutionSLAStatus = resolvedAt <= slaDeadlines.resolutionDue
                    ? SLAStatus.ON_TIME
                    : SLAStatus.BREACHED;
            } else if (template.status !== TicketStatus.CLOSED) {
                const now = new Date();
                if (now > slaDeadlines.resolutionDue) {
                    resolutionSLAStatus = SLAStatus.BREACHED;
                } else {
                    const hoursToSLA = (slaDeadlines.resolutionDue.getTime() - now.getTime()) / (1000 * 60 * 60);
                    resolutionSLAStatus = hoursToSLA <= 4 ? SLAStatus.AT_RISK : SLAStatus.ON_TIME;
                }
            }

            const ticket = this.ticketRepository.create({
                ticketNumber: this.ticketNumberService.generateTicketNumber(),
                title: template.title,
                description: template.description,
                status: template.status,
                priority: template.priority,
                additionalData: template.additionalData,
                requesterId: requester.id,
                categoryId: category.id,
                assignedAgentId: agent?.id,
                createdAt,
                firstResponseDue: slaDeadlines.firstResponseDue,
                resolutionDue: slaDeadlines.resolutionDue,
                firstResponseAt,
                resolvedAt,
                firstResponseSLAStatus,
                resolutionSLAStatus,
                categorySnapshot: {
                    id: category.id,
                    name: category.name,
                    sla: category.sla,
                    additionalFields: category.additionalFields,
                },
            });

            tickets.push(ticket);
        }

        // Guardar tickets
        const savedTickets = await this.ticketRepository.save(tickets);

        // Crear comentarios para algunos tickets
        const comments: TicketComment[] = [];

        for (const ticket of savedTickets) {
            if (ticket.status !== TicketStatus.OPEN) {
                // Comentario inicial del agente
                const agentComment = this.commentRepository.create({
                    content: `Thank you for reporting this issue. I'm looking into it now and will update you shortly.`,
                    type: CommentType.PUBLIC,
                    ticketId: ticket.id,
                    authorId: ticket.assignedAgentId,
                    isFirstResponse: true,
                    createdAt: ticket.firstResponseAt ?? new Date(),
                });
                comments.push(agentComment);

                if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
                    // Comentario de resolución
                    const resolutionComment = this.commentRepository.create({
                        content: `This issue has been resolved. The problem was identified and fixed. Please test and let us know if you experience any further issues.`,
                        type: CommentType.PUBLIC,
                        ticketId: ticket.id,
                        authorId: ticket.assignedAgentId,
                        createdAt: ticket.resolvedAt ?? new Date(),
                    });
                    comments.push(resolutionComment);

                    if (ticket.status === TicketStatus.CLOSED) {
                        // Comentario de cierre del usuario
                        const closeComment = this.commentRepository.create({
                            content: `Thanks! Everything is working perfectly now. Issue resolved.`,
                            type: CommentType.PUBLIC,
                            ticketId: ticket.id,
                            authorId: ticket.requesterId,
                            createdAt: new Date(ticket.resolvedAt!.getTime() + 60 * 60 * 1000), // 1 hora después
                        });
                        comments.push(closeComment);
                    }
                }
            }
        }

        if (comments.length > 0) {
            await this.commentRepository.save(comments);
        }

        console.log(`✅ Created ${savedTickets.length} tickets with ${comments.length} comments`);
    }
}