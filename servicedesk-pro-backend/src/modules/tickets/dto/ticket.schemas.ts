import { z } from 'zod';
import { TicketStatus, TicketPriority } from '../entities/ticket.entity';

export const CreateTicketSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    categoryId: z.string().uuid('Category ID must be a valid UUID'),
    priority: z.enum([TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH]).optional(),
    additionalData: z.record(z.string(), z.any()).default({}),
});

export const UpdateTicketSchema = z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(10).optional(),
    status: z.enum(Object.values(TicketStatus)).optional(),
    priority: z.enum([TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH]).optional(),
    assignedAgentId: z.string().uuid().optional(),
    additionalData: z.record(z.string(), z.any()).optional(),
});

export const TicketQuerySchema = z.object({
    page: z.string().transform(val => parseInt(val, 10)).optional(),
    limit: z.string().transform(val => parseInt(val, 10)).optional(),
    search: z.string().optional(),
    status: z.enum(Object.values(TicketStatus)).optional(),
    priority: z.enum([TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH]).optional(),
    categoryId: z.string().uuid().optional(),
    assignedAgentId: z.string().uuid().optional(),
    requesterId: z.string().uuid().optional(),
    slaStatus: z.enum(['on_time', 'at_risk', 'breached']).optional(),
    dateFrom: z.string().refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'dateFrom must be a valid ISO date string',
    }).optional(),
    dateTo: z.string().refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'dateTo must be a valid ISO date string',
    }).optional(),
});

export const TicketCommentSchema = z.object({
    content: z.string().min(1, 'Comment content is required'),
    type: z.enum(['public', 'internal']).default('public'),
});

export const AssignTicketSchema = z.object({
    agentId: z.string().uuid('Agent ID must be a valid UUID'),
});

export type CreateTicketDto = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketDto = z.infer<typeof UpdateTicketSchema>;
export type TicketQueryDto = z.infer<typeof TicketQuerySchema>;
export type TicketCommentDto = z.infer<typeof TicketCommentSchema>;
export type AssignTicketDto = z.infer<typeof AssignTicketSchema>;