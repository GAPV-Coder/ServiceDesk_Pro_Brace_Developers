import { Controller, Post, Body, UseGuards, Get, Put } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import type {
    LoginDto,
    RegisterDto,
    ChangePasswordDto,
} from '../dto/uth.schemas';
import {
    LoginSchema,
    RegisterSchema,
    ChangePasswordSchema,
} from '../dto/uth.schemas';

// Las clases Swagger DTO se definen localmente para garantizar la compatibilidad con @nestjs/swagger para la documentación de la API,
// al tiempo que se mantiene la validación de tipos basada en Zod existente para garantizar la seguridad y la coherencia en tiempo de ejecución.

class LoginDtoSwagger {
    email: string;
    password: string;
}

class RegisterDtoSwagger {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
}

class ChangePasswordDtoSwagger {
    oldPassword: string;
    newPassword: string;
}

@ApiTags('auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: LoginDtoSwagger })
    @ApiResponse({ status: 200, description: 'User logged in successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterDtoSwagger })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async register(@Body(new ZodValidationPipe(RegisterSchema)) registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Retrieve current user profile' })
    @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: User })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfile(@CurrentUser() user: User) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            fullName: user.fullName,
            role: user.role,
            department: user.department,
            jobTitle: user.jobTitle,
            status: user.status,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
        };
    }

    @Put('change-password')
    @ApiOperation({ summary: 'Change user password' })
    @ApiBody({ type: ChangePasswordDtoSwagger })
    @ApiResponse({ status: 200, description: 'Password changed successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async changePassword(
        @CurrentUser() user: User,
        @Body(new ZodValidationPipe(ChangePasswordSchema)) changePasswordDto: ChangePasswordDto,
    ) {
        await this.authService.changePassword(user.id, changePasswordDto);
        return { message: 'Password changed successfully' };
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh user token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async refreshToken(@CurrentUser() user: User) {
        return this.authService.refreshToken(user.id);
    }

    @Post('logout')
    @ApiOperation({ summary: 'User logout' })
    @ApiResponse({ status: 200, description: 'Logged out successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async logout() {
        // En una implementación real, se podría invalidar el token en una blacklist
        // Por ahora solo retornamos éxito
        return { message: 'Logged out successfully' };
    }
}
