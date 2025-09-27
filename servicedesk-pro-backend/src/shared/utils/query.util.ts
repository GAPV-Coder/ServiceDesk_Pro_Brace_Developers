import { SelectQueryBuilder } from 'typeorm';

export class QueryUtil {
    static applyTextSearch<T extends import('typeorm').ObjectLiteral>(
        query: SelectQueryBuilder<T>,
        searchTerm: string,
        searchFields: string[]
    ): SelectQueryBuilder<T> {
        if (!searchTerm?.trim()) {
            return query;
        }

        const conditions = searchFields.map(field => `${field} ILIKE :searchTerm`);
        query.andWhere(`(${conditions.join(' OR ')})`, {
            searchTerm: `%${searchTerm.trim()}%`,
        });

        return query;
    }

    static applyDateRange<T extends import('typeorm').ObjectLiteral>(
        query: SelectQueryBuilder<T>,
        dateField: string,
        dateFrom?: string,
        dateTo?: string
    ): SelectQueryBuilder<T> {
        if (dateFrom) {
            query.andWhere(`${dateField} >= :dateFrom`, { dateFrom: new Date(dateFrom) });
        }

        if (dateTo) {
            query.andWhere(`${dateField} <= :dateTo`, { dateTo: new Date(dateTo) });
        }

        return query;
    }

    static applyEnumFilter<T extends import('typeorm').ObjectLiteral>(
        query: SelectQueryBuilder<T>,
        field: string,
        value?: string
    ): SelectQueryBuilder<T> {
        if (value) {
            query.andWhere(`${field} = :${field}`, { [field]: value });
        }

        return query;
    }
}