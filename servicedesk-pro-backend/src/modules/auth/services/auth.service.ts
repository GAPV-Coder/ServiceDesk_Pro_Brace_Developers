import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { HashService } from '../../../shared/services/hash.service';
import { LoginDto, RegisterDto, ChangePasswordDto } from '../dto/uth.schemas';

export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        department: string;
        jobTitle: string;
    };
    accessToken: string;
    tokenType: string;
    expiresIn: number;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private hashService: HashService,
    ) { }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const { email, password } = loginDto;

        // Buscar usuario incluyendo password
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
            select: ['id', 'email', 'password', 'first_name', 'last_name', 'role', 'status', 'department', 'jobTitle'],
        });

        if (!user || !user.isActive()) {
            throw new UnauthorizedException('Invalid credentials or account is inactive');
        }

        // Verificar password
        const isPasswordValid = await this.hashService.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Actualizar último login
        await this.userRepository.update(user.id, { lastLoginAt: new Date() });

        // Generar token
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                department: user.department,
                jobTitle: user.jobTitle,
            },
            accessToken,
            tokenType: 'Bearer',
            expiresIn: 24 * 60 * 60, // 24 hours in seconds
        };
    }

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const { email, password, firstName, lastName, department, jobTitle } = registerDto;

        // Verificar si el usuario ya existe
        const existingUser = await this.userRepository.findOne({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await this.hashService.hash(password);

        // Crear usuario
        const user = this.userRepository.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            first_name: firstName,
            last_name: lastName,
            department,
            jobTitle,
            role: UserRole.REQUESTER, // Por defecto es requester
        });

        const savedUser = await this.userRepository.save(user);

        // Generar token
        const payload: JwtPayload = {
            sub: savedUser.id,
            email: savedUser.email,
            role: savedUser.role,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            user: {
                id: savedUser.id,
                email: savedUser.email,
                firstName: savedUser.first_name,
                lastName: savedUser.last_name,
                role: savedUser.role,
                department: savedUser.department,
                jobTitle: savedUser.jobTitle,
            },
            accessToken,
            tokenType: 'Bearer',
            expiresIn: 24 * 60 * 60,
        };
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const { currentPassword, newPassword } = changePasswordDto;

        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'password'],
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Verificar password actual
        const isCurrentPasswordValid = await this.hashService.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Hash nueva password
        const hashedNewPassword = await this.hashService.hash(newPassword);

        // Actualizar password
        await this.userRepository.update(userId, { password: hashedNewPassword });
    }

    async validateToken(token: string): Promise<User> {
        try {
            const payload = this.jwtService.verify<JwtPayload>(token);

            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
            });

            if (!user || !user.isActive()) {
                throw new UnauthorizedException('Invalid token or user inactive');
            }

            return user;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    async getUserFromToken(token: string): Promise<User | null> {
        try {
            return await this.validateToken(token);
        } catch {
            return null;
        }
    }

    async refreshToken(userId: string): Promise<{ accessToken: string; expiresIn: number }> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user || !user.isActive()) {
            throw new UnauthorizedException('User not found or inactive');
        }

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            expiresIn: 24 * 60 * 60,
        };
    }
}