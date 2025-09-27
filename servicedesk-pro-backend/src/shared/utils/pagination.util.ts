export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export class PaginationUtil {
    static createPaginationResult<T>(
        data: T[],
        totalItems: number,
        options: PaginationOptions
    ): PaginationResult<T> {
        const { page, limit } = options;
        const totalPages = Math.ceil(totalItems / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }

    static getSkip(page: number, limit: number): number {
        return (page - 1) * limit;
    }
}