import { z } from 'zod'

export const createTicketSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    categoryId: z.string().min(1, 'Please select a category'),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    additionalData: z.record(z.string(), z.any()).optional(),
})

export const updateTicketSchema = z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(10).optional(),
    status: z.enum(['open', 'in_progress', 'pending_customer', 'pending_vendor', 'resolved', 'closed', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    assignedAgentId: z.string().optional(),
    additionalData: z.record(z.string(), z.any()).optional(),
})

export const addCommentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty'),
    type: z.enum(['public', 'internal']).optional(),
})

export type CreateTicketFormData = z.infer<typeof createTicketSchema>
export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>
export type AddCommentFormData = z.infer<typeof addCommentSchema>