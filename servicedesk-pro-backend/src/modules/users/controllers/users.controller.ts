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
import { UsersService } from '../services/users.service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { User, UserRole } from '../entities/user.entity';
import { AuditAction } from '../../audit/entities/audit-log.entity';
import type { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dto/user.schemas';
import {
    CreateUserSchema,
    UpdateUserSchema,
    UserQuerySchema,
} from '../dto/user.schemas';
import type { UUIDParamDto } from '../../../shared/dto/common.schemas';
import { UUIDParamSchema } from '../../../shared/dto/common.schemas';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @Roles(UserRole.MANAGER)
    async findAll(@Query(new ZodValidationPipe(UserQuerySchema)) query: UserQueryDto) {
        return this.usersService.findAll(query);
    }

    @Get('agents')
    @Roles(UserRole.AGENT, UserRole.MANAGER)
    async getAgents() {
        return this.usersService.getAgents();
    }

    @Get('departments')
    @Roles(UserRole.MANAGER)
    async getDepartments() {
        return this.usersService.getDepartments();
    }

    @Get('search')
    @Roles(UserRole.AGENT, UserRole.MANAGER)
    async searchUsers(
        @Query('q') searchTerm: string,
        @Query('roles') roles?: string,
    ) {
        const roleArray = roles ? roles.split(',') as UserRole[] : undefined;
        return this.usersService.searchUsers(searchTerm, roleArray);
    }

    @Get('me')
    async getProfile(@CurrentUser() user: User) {
        const stats = await this.usersService.getUserStats(user.id);
        return {
            ...user,
            stats,
        };
    }

    @Get(':id')
    @Roles(UserRole.AGENT, UserRole.MANAGER)
    async findOne(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        return this.usersService.findById(params.id);
    }

    @Get(':id/stats')
    @Roles(UserRole.MANAGER)
    async getUserStats(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        return this.usersService.getUserStats(params.id);
    }

    @Post()
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.USER_CREATED, 'user')
    async create(@Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Put(':id')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.USER_UPDATED, 'user')
    async update(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(params.id, updateUserDto);
    }

    @Put(':id/role')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.USER_UPDATED, 'user')
    async changeRole(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Body('role') role: UserRole,
    ) {
        return this.usersService.changeUserRole(params.id, role);
    }

    @Delete(':id')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.USER_UPDATED, 'user')
    async remove(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        await this.usersService.delete(params.id);
        return { message: 'User deactivated successfully' };
    }
}