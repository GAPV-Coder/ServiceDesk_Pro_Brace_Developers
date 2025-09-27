import { Controller, Post, Body, UseGuards, Get, Put } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('login')
    async login(@Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('register')
    async register(@Body(new ZodValidationPipe(RegisterSchema)) registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Get('me')
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
    async changePassword(
        @CurrentUser() user: User,
        @Body(new ZodValidationPipe(ChangePasswordSchema)) changePasswordDto: ChangePasswordDto,
    ) {
        await this.authService.changePassword(user.id, changePasswordDto);
        return { message: 'Password changed successfully' };
    }

    @Post('refresh')
    async refreshToken(@CurrentUser() user: User) {
        return this.authService.refreshToken(user.id);
    }

    @Post('logout')
    async logout() {
        // En una implementación real, se podría invalidar el token en una blacklist
        // Por ahora solo retornamos éxito
        return { message: 'Logged out successfully' };
    }
}
