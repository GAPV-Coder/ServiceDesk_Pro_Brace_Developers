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
import { UsersService } from '../services/users.service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { AuditAction } from '../../audit/entities/audit-log.entity';
import type { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dto/user.schemas';
import {
    CreateUserSchema,
    UpdateUserSchema,
    UserQuerySchema,
} from '../dto/user.schemas';
import type { UUIDParamDto } from '../../../shared/dto/common.schemas';
import { UUIDParamSchema } from '../../../shared/dto/common.schemas';

// Las clases Swagger DTO se definen localmente para garantizar la compatibilidad con @nestjs/swagger para la documentación de la API,
// al tiempo que se mantiene la validación de tipos basada en Zod existente para garantizar la seguridad y la coherencia en tiempo de ejecución.
class CreateUserDtoSwagger {
    @ApiProperty({ description: 'User email', example: 'user@example.com', required: true })
    email: string;

    @ApiProperty({ description: 'User name', example: 'John', required: true })
    first_name: string;

    @ApiProperty({ description: 'User last name', example: 'Doe', required: true })
    last_name: string;

    @ApiProperty({ description: 'User password', example: 'securepassword', required: true })
    password: string;

    @ApiProperty({ enum: Object.values(UserRole), description: 'User role', example: UserRole.REQUESTER, required: false })
    role: UserRole;

    @ApiProperty({ description: 'User department', example: 'IT', required: false })
    department?: string;

    @ApiProperty({ description: 'Title of user work', example: 'Developer', required: false })
    jobTitle?: string;
}

class UpdateUserDtoSwagger {
    @ApiProperty({ description: 'User name', example: 'John', required: false })
    first_name?: string;

    @ApiProperty({ description: 'User last name', example: 'Doe', required: false })
    last_name?: string;

    @ApiProperty({ description: 'User department', example: 'IT', required: false })
    department?: string;

    @ApiProperty({ description: 'Title of the user work', example: 'Developer', required: false })
    jobTitle?: string;

    @ApiProperty({ enum: Object.values(UserStatus), description: 'User status', required: false })
    status?: UserStatus;

    @ApiProperty({ enum: Object.values(UserRole), description: 'User role', required: false })
    role?: UserRole;

    @ApiProperty({ description: 'User email', example: 'user@example.com', required: false })
    email?: string;
}

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @Roles(UserRole.MANAGER)
    @ApiOperation({ summary: 'Retrieve a list of all users' })
    @ApiResponse({ status: 200, description: 'List of users retrieved successfully', type: [User] })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async findAll(@Query(new ZodValidationPipe(UserQuerySchema)) query: UserQueryDto) {
        return this.usersService.findAll(query);
    }

    @Get('agents')
    @Roles(UserRole.AGENT, UserRole.MANAGER)
    @ApiOperation({ summary: 'Retrieve a list of agents' })
    @ApiResponse({ status: 200, description: 'List of agents retrieved successfully', type: [User] })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async getAgents() {
        return this.usersService.getAgents();
    }

    @Get('departments')
    @Roles(UserRole.MANAGER)
    @ApiOperation({ summary: 'Retrieve a list of departments' })
    @ApiResponse({ status: 200, description: 'List of departments retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async getDepartments() {
        return this.usersService.getDepartments();
    }

    @Get('search')
    @Roles(UserRole.AGENT, UserRole.MANAGER)
    @ApiOperation({ summary: 'Search for users by term and roles' })
    @ApiQuery({ name: 'q', type: 'string', description: 'Search term' })
    @ApiQuery({ name: 'roles', type: 'string', description: 'Comma-separated roles', required: false })
    @ApiResponse({ status: 200, description: 'Search results retrieved successfully', type: [User] })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async searchUsers(
        @Query('q') searchTerm: string,
        @Query('roles') roles?: string,
    ) {
        const roleArray = roles ? roles.split(',') as UserRole[] : undefined;
        return this.usersService.searchUsers(searchTerm, roleArray);
    }

    @Get('me')
    @ApiOperation({ summary: 'Retrieve current user profile with stats' })
    @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: User })
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
    @ApiOperation({ summary: 'Retrieve stats for a user by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
    @ApiResponse({ status: 200, description: 'User stats retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserStats(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        return this.usersService.getUserStats(params.id);
    }

    @Post()
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.USER_CREATED, 'user')
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({ type: CreateUserDtoSwagger })
    @ApiResponse({ status: 201, description: 'User created successfully', type: User })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async create(@Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Put(':id')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.USER_UPDATED, 'user')
    @ApiOperation({ summary: 'Update a user by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
    @ApiBody({ type: UpdateUserDtoSwagger })
    @ApiResponse({ status: 200, description: 'User updated successfully', type: User })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async update(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(params.id, updateUserDto);
    }

    @Put(':id/role')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.USER_UPDATED, 'user')
    @ApiOperation({ summary: 'Change user role by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
    @ApiBody({ schema: { properties: { role: { type: 'string', enum: Object.values(UserRole) } } } })
    @ApiResponse({ status: 200, description: 'User role changed successfully', type: User })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async changeRole(
        @Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto,
        @Body('role') role: UserRole,
    ) {
        return this.usersService.changeUserRole(params.id, role);
    }

    @Delete(':id')
    @Roles(UserRole.MANAGER)
    @Audit(AuditAction.USER_UPDATED, 'user')
    @ApiOperation({ summary: 'Deactivate a user by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
    @ApiResponse({ status: 200, description: 'User deactivated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async remove(@Param(new ZodValidationPipe(UUIDParamSchema)) params: UUIDParamDto) {
        await this.usersService.delete(params.id);
        return { message: 'User deactivated successfully' };
    }
}