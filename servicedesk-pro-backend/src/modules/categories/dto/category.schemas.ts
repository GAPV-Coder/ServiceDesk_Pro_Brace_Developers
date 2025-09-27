import { z } from 'zod';

const CategoryFieldValidationSchema = z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
});

const CategoryFieldSchema = z.object({
    id: z.string(),
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'textarea', 'select', 'number', 'date', 'boolean']),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
    validation: CategoryFieldValidationSchema.optional(),
});

const CategorySLASchema = z.object({
    firstResponseHours: z.number().min(0.5, 'First response time must be at least 30 minutes'),
    resolutionHours: z.number().min(1, 'Resolution time must be at least 1 hour'),
});

export const CreateCategorySchema = z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    additionalFields: z.array(CategoryFieldSchema).default([]),
    sla: CategorySLASchema,
    color: z.string().optional(),
    icon: z.string().optional(),
});

export const UpdateCategorySchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    additionalFields: z.array(CategoryFieldSchema).optional(),
    sla: CategorySLASchema.optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export type CategoryFieldDto = z.infer<typeof CategoryFieldSchema>;
export type CategorySLADto = z.infer<typeof CategorySLASchema>;