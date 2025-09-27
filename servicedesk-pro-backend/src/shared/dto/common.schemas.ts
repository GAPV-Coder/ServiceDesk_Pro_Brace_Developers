import { z } from 'zod';

export const PaginationQuerySchema = z.object({
    page: z.string().transform(val => Math.max(1, parseInt(val, 10) || 1)),
    limit: z.string().transform(val => Math.min(100, Math.max(1, parseInt(val, 10) || 10))),
});

export const UUIDParamSchema = z.object({
    id: z.string().uuid('ID must be a valid UUID'),
});

export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>;
export type UUIDParamDto = z.infer<typeof UUIDParamSchema>;