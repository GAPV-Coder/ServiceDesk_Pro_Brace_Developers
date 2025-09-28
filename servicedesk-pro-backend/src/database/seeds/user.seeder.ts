import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../../modules/users/entities/user.entity';
import { HashService } from '../../shared/services/hash.service';

@Injectable()
export class UserSeeder {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private hashService: HashService,
    ) { }

    async seed(): Promise<void> {
        // Verificar si ya existen usuarios
        const existingUsers = await this.userRepository.count();
        if (existingUsers > 0) {
            console.log('Users already exist, skipping seeding');
            return;
        }

        const defaultPassword = await this.hashService.hash('password123');

        const users = [
            // Manager
            {
                email: 'manager@servicedesk.com',
                first_name: 'Admin',
                last_name: 'Manager',
                password: defaultPassword,
                role: UserRole.MANAGER,
                status: UserStatus.ACTIVE,
                department: 'IT Management',
                jobTitle: 'IT Manager',
            },
            // Agents
            {
                email: 'agent1@servicedesk.com',
                first_name: 'John',
                last_name: 'Smith',
                password: defaultPassword,
                role: UserRole.AGENT,
                status: UserStatus.ACTIVE,
                department: 'IT Support',
                jobTitle: 'Senior Support Agent',
            },
            {
                email: 'agent2@servicedesk.com',
                first_name: 'Sarah',
                last_name: 'Johnson',
                password: defaultPassword,
                role: UserRole.AGENT,
                status: UserStatus.ACTIVE,
                department: 'IT Support',
                jobTitle: 'Support Agent',
            },
            {
                email: 'agent3@servicedesk.com',
                first_name: 'Mike',
                last_name: 'Wilson',
                password: defaultPassword,
                role: UserRole.AGENT,
                status: UserStatus.ACTIVE,
                department: 'Development',
                jobTitle: 'DevOps Engineer',
            },
            // Requesters
            {
                email: 'user1@company.com',
                first_name: 'Alice',
                last_name: 'Brown',
                password: defaultPassword,
                role: UserRole.REQUESTER,
                status: UserStatus.ACTIVE,
                department: 'Marketing',
                jobTitle: 'Marketing Specialist',
            },
            {
                email: 'user2@company.com',
                first_name: 'Bob',
                last_name: 'Davis',
                password: defaultPassword,
                role: UserRole.REQUESTER,
                status: UserStatus.ACTIVE,
                department: 'Sales',
                jobTitle: 'Sales Representative',
            },
            {
                email: 'user3@company.com',
                first_name: 'Carol',
                last_name: 'Miller',
                password: defaultPassword,
                role: UserRole.REQUESTER,
                status: UserStatus.ACTIVE,
                department: 'HR',
                jobTitle: 'HR Coordinator',
            },
            {
                email: 'user4@company.com',
                first_name: 'David',
                last_name: 'Garcia',
                password: defaultPassword,
                role: UserRole.REQUESTER,
                status: UserStatus.ACTIVE,
                department: 'Finance',
                jobTitle: 'Financial Analyst',
            },
            {
                email: 'user5@company.com',
                first_name: 'Emma',
                last_name: 'Martinez',
                password: defaultPassword,
                role: UserRole.REQUESTER,
                status: UserStatus.ACTIVE,
                department: 'Operations',
                jobTitle: 'Operations Manager',
            },
        ];

        const createdUsers = this.userRepository.create(users);
        await this.userRepository.save(createdUsers);

        console.log(`✅ Created ${users.length} users`);
    }
}