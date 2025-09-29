import { z } from 'zod'

const categoryFieldSchema = z.object({
    id: z.string(),
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'textarea', 'select', 'number', 'date', 'boolean']),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
    validation: z.object({
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
    }).optional(),
})

export const createCategorySchema = z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    additionalFields: z.array(categoryFieldSchema).default([]),
    sla: z.object({
        firstResponseHours: z.number().min(0.5, 'First response time must be at least 30 minutes'),
        resolutionHours: z.number().min(1, 'Resolution time must be at least 1 hour'),
    }),
    color: z.string().optional(),
    icon: z.string().optional(),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>
export type CategoryFieldFormData = z.infer<typeof categoryFieldSchema>