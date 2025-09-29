import { z } from 'zod'

export const createUserSchema = z.object({
    email: z.string().email('Email must be valid'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    role: z.enum(['requester', 'agent', 'manager']).default('requester'),
    department: z.string().optional(),
    jobTitle: z.string().optional(),
})

export const updateUserSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    department: z.string().optional(),
    jobTitle: z.string().optional(),
    status: z.string().optional(),
    role: z.enum(['requester', 'agent', 'manager']).optional(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>