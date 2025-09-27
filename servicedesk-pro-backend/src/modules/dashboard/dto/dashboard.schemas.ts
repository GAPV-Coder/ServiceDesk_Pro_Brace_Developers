import { z } from 'zod';

export const DashboardQuerySchema = z.object({
    period: z.enum(['7d', '30d', '90d']).default('7d'),
    categoryId: z.string().uuid().optional(),
    agentId: z.string().uuid().optional(),
});

export type DashboardQueryDto = z.infer<typeof DashboardQuerySchema>;