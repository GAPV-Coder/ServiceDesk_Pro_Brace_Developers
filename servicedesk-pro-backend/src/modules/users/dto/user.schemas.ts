import { z } from 'zod';
import { UserRole, UserStatus } from '../entities/user.entity';

export const CreateUserSchema = z.object({
    email: z.string().email('Email must be valid'),
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum([...Object.values(UserRole)]).default(UserRole.REQUESTER),
    department: z.string().optional(),
    jobTitle: z.string().optional(),
});

export const UpdateUserSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    department: z.string().optional(),
    jobTitle: z.string().optional(),
    status: z.enum([...Object.values(UserStatus)]).optional(),
    role: z.enum([...Object.values(UserRole)]).optional(),
});

export const UserQuerySchema = z.object({
    page: z.string().transform(val => parseInt(val, 10)).optional(),
    limit: z.string().transform(val => parseInt(val, 10)).optional(),
    search: z.string().optional(),
    role: z.enum([...Object.values(UserRole)]).optional(),
    status: z.enum([...Object.values(UserStatus)]).optional(),
    department: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserQueryDto = z.infer<typeof UserQuerySchema>;