import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketComment } from './entities/ticket-comment.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { TicketsController } from './controllers/tickets.controller';
import { TicketsService } from './services/tickets.service';
import { TicketEventsService } from './services/ticket-events.service';
import { SLAMonitorService } from './services/sla-monitor.service';
import { CategoriesService } from '../categories/services/categories.service';
import { TicketNumberService } from '../../shared/services/ticket-number.service';
import { SLAService } from '../../shared/services/sla.service';
import { AuditService } from '../../shared/services/audit.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Ticket,
            TicketComment,
            User,
            Category,
            AuditLog,
        ]),
    ],
    controllers: [TicketsController],
    providers: [
        TicketsService,
        TicketEventsService,
        SLAMonitorService,
        CategoriesService,
        TicketNumberService,
        SLAService,
        AuditService,
    ],
    exports: [TicketsService],
})
export class TicketsModule { }