import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam,
    ApiBody,
    ApiBearerAuth,
    ApiProperty
} from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { AuditAction } from '../../audit/entities/audit-log.entity';
import {
    CreateCategorySchema,
    UpdateCategorySchema,
} from '../dto/category.schemas';
import type {
    CreateCategoryDto,
    UpdateCategoryDto,
} from '../dto/category.schemas';
import { UUIDParamSchema } from '../../../shared/dto/common.schemas';
import type { UUIDParamDto } from '../../../shared/dto/common.schemas';

// Las clases Swagger DTO se definen localmente para garantizar la compatibilidad con @nestjs/swagger para la documentación de la API,
// al tiempo que se mantiene la validación de tipos basada en Zod existente para garantizar la seguridad y la coherencia en tiempo de ejecución.

class CategoryFieldValidationSwagger {
    @ApiProperty({ description: 'Minimum length', required: false })
    minLength?: number;

    @ApiProperty({ description: 'Maximum length', required: false })
    maxLength?: number;

    @ApiProperty({ description: 'Minimum value', required: false })
    min?: number;

    @ApiProperty({ description: 'Maximum value', required: false })
    max?: number;

    @ApiProperty({ description: 'Regex pattern', required: false })
    pattern?: string;
}

class CategoryFieldSwagger {
    @ApiProperty({ description: 'Field ID', required: true })
    id: string;

    @ApiProperty({ description: 'Field name', required: true })
    name: string;

    @ApiProperty({ description: 'Field label', required: true })
    label: string;

    @ApiProperty({ enum: ['text', 'textarea', 'select', 'number', 'date', 'boolean'], description: 'Field type', required: true })
    type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'boolean';

    @ApiProperty({ description: 'If the field is required', required: true })
    required: boolean;

    @ApiProperty({ type: [String], description: 'Options for select', required: false })
    options?: string[];

    @ApiProperty({ type: CategoryFieldValidationSwagger, description: 'Field validations', required: false })
    validation?: CategoryFieldValidationSwagger;
}

class CategorySLASwagger {
    @ApiProperty({ description: 'Hours for initial response', example: 2, required: true })
    firstResponseHours: number;

    @ApiProperty({ description: 'Hours for resolution', example: 8, required: true })
    resolutionHours: number;
}

class CreateCategoryDtoSwagger {
    @ApiProperty({ description: 'Category name', example: 'Technical Support', required: true })
    name: string;

    @ApiProperty({ description: 'Category description', example: 'Category for technical support', required: true })
    description: string;

    @ApiProperty({ type: [CategoryFieldSwagger], description: 'Additional fields', required: false })
    additionalFields?: CategoryFieldSwagger[];

    @ApiProperty({ type: CategorySLASwagger, description: 'Category SLA', required: true })
    sla: CategorySLASwagger;

    @ApiProperty({ description: 'Category color', example: '#FF0000', required: false })
    color?: string;

    @ApiProperty({ description: 'Category icon', example: 'icon-name', required: false })
    icon?: string;
}

class UpdateCategoryDtoSwagger {
    @ApiProperty({ description: 'Category name', example: 'Technical Support', required: false })
    name?: string;

    @ApiProperty({ description: 'Category description', example: 'Category for technical support', required: false })
    description?: string;

    @ApiProperty({ type: [CategoryFieldSwagger], description: 'Additional fields', required: false })
    additionalFields?: CategoryFieldSwagger[];

    @ApiProperty({ type: CategorySLASwagger, description: 'Category SLA', required: false })
    sla?: CategorySLASwagger;

    @ApiProperty({ description: 'If the category is active', required: false })
    isActive?: boolean;

    @ApiProperty({ description: 'Sorting order', required: false })
    sortOrder?: number;

    @ApiProperty({ description: 'Category color', example: '#FF0000', required: false })
    color?: string;

    @ApiProperty({ description: 'Category icon', example: 'icon-name', required: false })
    icon?: string;
}

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve a list of all categories' })
    @ApiQuery({ name: 'includeInactive', type: 'string', required: false, description: 'Include inactive categories (true/false)' })
    @ApiResponse({ status: 200, description: 'List of categories retrieved successfully' })
    async findAll(@Query('includeInactive') includeInactive?: string) {
        const include = includeInactive === 'true';
        return this.categoriesService.findAll(include);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a single category by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Category UUID' })
    @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async findOne(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        return this.categoriesService.findById(params.id);
    }

    @Get(':id/stats')
    @Roles(UserRole.AGENT, UserRole.MANAGER)
    @ApiOperation({ summary: 'Retrieve stats for a category by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Category UUID' })
    @ApiResponse({ status: 200, description: 'Category stats retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async getCategoryStats(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        return this.categoriesService.getCategoryStats(params.id);
    }

    @Post()
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.CATEGORY_CREATED, 'category')
    @ApiOperation({ summary: 'Create a new category' })
    @ApiBody({ type: CreateCategoryDtoSwagger })
    @ApiResponse({ status: 201, description: 'Category created successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async create(@Body(new ZodValidationPipe(CreateCategorySchema)) createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Put(':id')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.CATEGORY_UPDATED, 'category')
    @ApiOperation({ summary: 'Update a category by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Category UUID' })
    @ApiBody({ type: UpdateCategoryDtoSwagger })
    @ApiResponse({ status: 200, description: 'Category updated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async update(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Body(new ZodValidationPipe(UpdateCategorySchema)) updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(params.id, updateCategoryDto);
    }

    @Put(':id/activate')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.CATEGORY_UPDATED, 'category')
    @ApiOperation({ summary: 'Activate a category by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Category UUID' })
    @ApiResponse({ status: 200, description: 'Category activated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async activate(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        return this.categoriesService.activate(params.id);
    }

    @Put(':id/deactivate')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.CATEGORY_UPDATED, 'category')
    @ApiOperation({ summary: 'Deactivate a category by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Category UUID' })
    @ApiResponse({ status: 200, description: 'Category deactivated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async deactivate(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        return this.categoriesService.deactivate(params.id);
    }

    @Put('reorder')
    @Roles(UserRole.MANAGER)
    @ApiOperation({ summary: 'Reorder categories' })
    @ApiBody({ schema: { properties: { categoryIds: { type: 'array', items: { type: 'string' } } } } })
    @ApiResponse({ status: 200, description: 'Categories reordered successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async reorderCategories(@Body('categoryIds') categoryIds: string[]) {
        await this.categoriesService.reorderCategories(categoryIds);
        return { message: 'Categories reordered successfully' };
    }

    @Post(':id/validate-data')
    @ApiOperation({ summary: 'Validate category data by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Category UUID' })
    @ApiBody({ schema: { type: 'object', additionalProperties: true } })
    @ApiResponse({ status: 200, description: 'Data validated successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async validateCategoryData(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Body('data') data: Record<string, any>,
    ) {
        return this.categoriesService.validateCategoryFieldData(params.id, data);
    }

    @Delete(':id')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.CATEGORY_UPDATED, 'category')
    @ApiOperation({ summary: 'Remove a category by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Category UUID' })
    @ApiResponse({ status: 200, description: 'Category removed successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async remove(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        await this.categoriesService.delete(params.id);
        return { message: 'Category removed successfully' };
    }
}