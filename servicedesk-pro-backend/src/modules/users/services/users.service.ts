import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { HashService } from '../../../shared/services/hash.service';
import { PaginationUtil, PaginationResult } from '../../../shared/utils/pagination.util';
import { QueryUtil } from '../../../shared/utils/query.util';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dto/user.schemas';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private hashService: HashService,
    ) { }

    async findAll(queryDto: UserQueryDto): Promise<PaginationResult<User>> {
        const { page = 1, limit = 10, search, role, status, department } = queryDto;

        const query = this.userRepository.createQueryBuilder('user');

        // Aplicar filtros
        if (search) {
            QueryUtil.applyTextSearch(query, search, [
                'user.first_name',
                'user.last_name',
                'user.email',
                'user.department',
                'user.jobTitle'
            ]);
        }

        QueryUtil.applyEnumFilter(query, 'user.role', role);
        QueryUtil.applyEnumFilter(query, 'user.status', status);

        if (department) {
            query.andWhere('user.department = :department', { department });
        }

        // Contar total
        const totalItems = await query.getCount();

        // Aplicar paginación
        query
            .orderBy('user.createdAt', 'DESC')
            .skip(PaginationUtil.getSkip(page, limit))
            .take(limit);

        const users = await query.getMany();

        return PaginationUtil.createPaginationResult(users, totalItems, { page, limit });
    }

    async findById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['requestedTickets', 'assignedTickets'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email: email.toLowerCase() },
        });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { email, password, ...userData } = createUserDto;

        // Verificar si el email ya existe
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await this.hashService.hash(password);

        // Crear usuario
        const user = this.userRepository.create({
            ...userData,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        return this.userRepository.save(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findById(id);

        // Si se está actualizando el email, verificar que no exista
        if (updateUserDto.email) {
            const existingUser = await this.findByEmail(updateUserDto.email);
            if (existingUser && existingUser.id !== id) {
                throw new ConflictException('User with this email already exists');
            }
        }

        Object.assign(user, updateUserDto);

        if (updateUserDto.email) {
            user.email = updateUserDto.email.toLowerCase();
        }

        return this.userRepository.save(user);
    }

    async delete(id: string): Promise<void> {
        const user = await this.findById(id);

        // En lugar de borrar físicamente, marcamos como inactivo
        user.status = UserStatus.INACTIVE;
        await this.userRepository.save(user);
    }

    async changeUserRole(id: string, newRole: UserRole): Promise<User> {
        const user = await this.findById(id);
        user.role = newRole;
        return this.userRepository.save(user);
    }

    async changeUserStatus(id: string, newStatus: UserStatus): Promise<User> {
        const user = await this.findById(id);
        user.status = newStatus;
        return this.userRepository.save(user);
    }

    async getAgents(): Promise<User[]> {
        return this.userRepository.find({
            where: [
                { role: UserRole.AGENT, status: UserStatus.ACTIVE },
                { role: UserRole.MANAGER, status: UserStatus.ACTIVE },
            ],
            order: { first_name: 'ASC' },
        });
    }

    async getUserStats(userId: string): Promise<{
        totalTicketsRequested: number;
        totalTicketsAssigned: number;
        openTicketsRequested: number;
        openTicketsAssigned: number;
    }> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['requestedTickets', 'assignedTickets'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const totalTicketsRequested = user.requestedTickets?.length || 0;
        const totalTicketsAssigned = user.assignedTickets?.length || 0;

        const openTicketsRequested = user.requestedTickets?.filter(ticket => ticket.isOpen()).length || 0;
        const openTicketsAssigned = user.assignedTickets?.filter(ticket => ticket.isOpen()).length || 0;

        return {
            totalTicketsRequested,
            totalTicketsAssigned,
            openTicketsRequested,
            openTicketsAssigned,
        };
    }

    async getDepartments(): Promise<string[]> {
        const result = await this.userRepository
            .createQueryBuilder('user')
            .select('DISTINCT user.department', 'department')
            .where('user.department IS NOT NULL')
            .andWhere('user.department != :empty', { empty: '' })
            .orderBy('user.department', 'ASC')
            .getRawMany();

        return result.map(row => row.department);
    }

    async updateLastLogin(userId: string): Promise<void> {
        await this.userRepository.update(userId, { lastLoginAt: new Date() });
    }

    async bulkUpdateStatus(userIds: string[], status: UserStatus): Promise<void> {
        await this.userRepository.update(userIds, { status });
    }

    async searchUsers(searchTerm: string, roles?: UserRole[]): Promise<User[]> {
        const query = this.userRepository.createQueryBuilder('user');

        QueryUtil.applyTextSearch(query, searchTerm, [
            'user.first_name',
            'user.last_name',
            'user.email'
        ]);

        if (roles && roles.length > 0) {
            query.andWhere('user.role IN (:...roles)', { roles });
        }

        query.andWhere('user.status = :status', { status: UserStatus.ACTIVE });
        query.orderBy('user.first_name', 'ASC');
        query.take(20); // Límite para búsquedas

        return query.getMany();
    }
}