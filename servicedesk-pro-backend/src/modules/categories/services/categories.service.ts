/* eslint-disable no-case-declarations */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.schemas';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async findAll(includeInactive: boolean = false): Promise<Category[]> {
        const query = this.categoryRepository.createQueryBuilder('category');

        if (!includeInactive) {
            query.where('category.isActive = :isActive', { isActive: true });
        }

        return query
            .orderBy('category.sortOrder', 'ASC')
            .addOrderBy('category.name', 'ASC')
            .getMany();
    }

    async findById(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['tickets'],
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async findByName(name: string): Promise<Category | null> {
        return this.categoryRepository.findOne({
            where: { name },
        });
    }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const { name, description, additionalFields, sla, color, icon } = createCategoryDto;

        // Verificar si ya existe una categoría con ese nombre
        const existingCategory = await this.findByName(name);
        if (existingCategory) {
            throw new ConflictException('Category with this name already exists');
        }

        // Validar campos adicionales
        this.validateAdditionalFields(additionalFields);

        // Obtener el siguiente sortOrder
        const maxSortOrder = await this.categoryRepository
            .createQueryBuilder('category')
            .select('MAX(category.sortOrder)', 'maxSort')
            .getRawOne();

        const sortOrder = (maxSortOrder?.maxSort || 0) + 1;

        const category = this.categoryRepository.create({
            name,
            description,
            additionalFields: additionalFields || [],
            sla,
            sortOrder,
            color,
            icon,
        });

        return this.categoryRepository.save(category);
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findById(id);

        // Si se está actualizando el nombre, verificar que no exista
        if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
            const existingCategory = await this.findByName(updateCategoryDto.name);
            if (existingCategory) {
                throw new ConflictException('Category with this name already exists');
            }
        }

        // Validar campos adicionales si se están actualizando
        if (updateCategoryDto.additionalFields) {
            this.validateAdditionalFields(updateCategoryDto.additionalFields);
        }

        Object.assign(category, updateCategoryDto);
        return this.categoryRepository.save(category);
    }

    async delete(id: string): Promise<void> {
        const category = await this.findById(id);

        // Verificar si hay tickets asociados
        if (category.tickets && category.tickets.length > 0) {
            // En lugar de eliminar, marcamos como inactiva
            category.isActive = false;
            await this.categoryRepository.save(category);
        } else {
            // Si no hay tickets, se puede eliminar físicamente
            await this.categoryRepository.remove(category);
        }
    }

    async activate(id: string): Promise<Category> {
        const category = await this.findById(id);
        category.isActive = true;
        return this.categoryRepository.save(category);
    }

    async deactivate(id: string): Promise<Category> {
        const category = await this.findById(id);
        category.isActive = false;
        return this.categoryRepository.save(category);
    }

    async reorderCategories(categoryIds: string[]): Promise<void> {
        // Actualizar el sortOrder de todas las categorías
        for (let i = 0; i < categoryIds.length; i++) {
            await this.categoryRepository.update(categoryIds[i], { sortOrder: i + 1 });
        }
    }

    async getCategoryStats(id: string): Promise<{
        totalTickets: number;
        openTickets: number;
        resolvedTickets: number;
        averageResolutionTime: number;
        slaCompliance: number;
    }> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['tickets'],
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        const tickets = category.tickets || [];
        const totalTickets = tickets.length;
        const openTickets = tickets.filter(ticket => ticket.isOpen()).length;
        const resolvedTickets = tickets.filter(ticket => ticket.isClosed()).length;

        // Calcular tiempo promedio de resolución
        const resolvedTicketsWithTime = tickets.filter(ticket =>
            ticket.resolvedAt && ticket.createdAt
        );

        const averageResolutionTime = resolvedTicketsWithTime.length > 0
            ? resolvedTicketsWithTime.reduce((sum, ticket) => {
                const resolutionTime = ticket.resolvedAt!.getTime() - ticket.createdAt.getTime();
                return sum + (resolutionTime / (1000 * 60 * 60)); // en horas
            }, 0) / resolvedTicketsWithTime.length
            : 0;

        // Calcular compliance de SLA
        const ticketsWithSLA = tickets.filter(ticket => ticket.resolvedAt);
        const slaCompliantTickets = ticketsWithSLA.filter(ticket =>
            ticket.resolutionSLAStatus === 'on_time'
        );

        const slaCompliance = ticketsWithSLA.length > 0
            ? (slaCompliantTickets.length / ticketsWithSLA.length) * 100
            : 100;

        return {
            totalTickets,
            openTickets,
            resolvedTickets,
            averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
            slaCompliance: Math.round(slaCompliance * 100) / 100,
        };
    }

    async validateCategoryFieldData(categoryId: string, data: Record<string, any>): Promise<{
        isValid: boolean;
        errors: string[];
    }> {
        const category = await this.findById(categoryId);
        const errors: string[] = [];

        for (const field of category.additionalFields) {
            const value = data[field.name];

            // Verificar campos requeridos
            if (field.required && (value === undefined || value === null || value === '')) {
                errors.push(`Field '${field.label}' is required`);
                continue;
            }

            // Si no hay valor y no es requerido, continuar
            if (value === undefined || value === null || value === '') {
                continue;
            }

            // Validar por tipo
            switch (field.type) {
                case 'text':
                case 'textarea':
                    if (typeof value !== 'string') {
                        errors.push(`Field '${field.label}' must be a string`);
                    } else {
                        if (field.validation?.minLength && value.length < field.validation.minLength) {
                            errors.push(`Field '${field.label}' must be at least ${field.validation.minLength} characters`);
                        }
                        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
                            errors.push(`Field '${field.label}' must be at most ${field.validation.maxLength} characters`);
                        }
                        if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
                            errors.push(`Field '${field.label}' format is invalid`);
                        }
                    }
                    break;

                case 'number':
                    const numValue = Number(value);
                    if (isNaN(numValue)) {
                        errors.push(`Field '${field.label}' must be a number`);
                    } else {
                        if (field.validation?.min !== undefined && numValue < field.validation.min) {
                            errors.push(`Field '${field.label}' must be at least ${field.validation.min}`);
                        }
                        if (field.validation?.max !== undefined && numValue > field.validation.max) {
                            errors.push(`Field '${field.label}' must be at most ${field.validation.max}`);
                        }
                    }
                    break;

                case 'select':
                    if (field.options && !field.options.includes(value)) {
                        errors.push(`Field '${field.label}' must be one of: ${field.options.join(', ')}`);
                    }
                    break;

                case 'date':
                    if (isNaN(Date.parse(value))) {
                        errors.push(`Field '${field.label}' must be a valid date`);
                    }
                    break;

                case 'boolean':
                    if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
                        errors.push(`Field '${field.label}' must be true or false`);
                    }
                    break;
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    private validateAdditionalFields(fields: any[]): void {
        const fieldNames = new Set<string>();
        const fieldIds = new Set<string>();

        for (const field of fields) {
            // Verificar duplicados por nombre
            if (fieldNames.has(field.name)) {
                throw new ConflictException(`Duplicate field name: ${field.name}`);
            }
            fieldNames.add(field.name);

            // Verificar duplicados por ID
            if (fieldIds.has(field.id)) {
                throw new ConflictException(`Duplicate field ID: ${field.id}`);
            }
            fieldIds.add(field.id);

            // Validar que campos select tengan opciones
            if (field.type === 'select' && (!field.options || field.options.length === 0)) {
                throw new ConflictException(`Select field '${field.name}' must have options`);
            }

            // Validar validaciones numéricas
            if (field.validation) {
                if (field.validation.min !== undefined && field.validation.max !== undefined) {
                    if (field.validation.min > field.validation.max) {
                        throw new ConflictException(`Field '${field.name}': min value cannot be greater than max value`);
                    }
                }
                if (field.validation.minLength !== undefined && field.validation.maxLength !== undefined) {
                    if (field.validation.minLength > field.validation.maxLength) {
                        throw new ConflictException(`Field '${field.name}': min length cannot be greater than max length`);
                    }
                }
            }
        }
    }
}