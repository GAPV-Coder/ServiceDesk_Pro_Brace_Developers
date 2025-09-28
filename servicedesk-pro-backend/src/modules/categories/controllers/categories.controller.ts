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

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) { }

    @Get()
    async findAll(@Query('includeInactive') includeInactive?: string) {
        const include = includeInactive === 'true';
        return this.categoriesService.findAll(include);
    }

    @Get(':id')
    async findOne(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        return this.categoriesService.findById(params.id);
    }

    @Get(':id/stats')
    @Roles(UserRole.AGENT, UserRole.MANAGER)
    async getCategoryStats(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        return this.categoriesService.getCategoryStats(params.id);
    }

    @Post()
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.CATEGORY_CREATED, 'category')
    async create(@Body(new ZodValidationPipe(CreateCategorySchema)) createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Put(':id')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.CATEGORY_UPDATED, 'category')
    async update(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Body(new ZodValidationPipe(UpdateCategorySchema)) updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(params.id, updateCategoryDto);
    }

    @Put(':id/activate')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.CATEGORY_UPDATED, 'category')
    async activate(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        return this.categoriesService.activate(params.id);
    }

    @Put(':id/deactivate')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.CATEGORY_UPDATED, 'category')
    async deactivate(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        return this.categoriesService.deactivate(params.id);
    }

    @Put('reorder')
    @Roles(UserRole.MANAGER)
    async reorderCategories(@Body('categoryIds') categoryIds: string[]) {
        await this.categoriesService.reorderCategories(categoryIds);
        return { message: 'Categories reordered successfully' };
    }

    @Post(':id/validate-data')
    async validateCategoryData(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Body('data') data: Record<string, any>,
    ) {
        return this.categoriesService.validateCategoryFieldData(params.id, data);
    }

    @Delete(':id')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.CATEGORY_UPDATED, 'category')
    async remove(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        await this.categoriesService.delete(params.id);
        return { message: 'Category removed successfully' };
    }
}