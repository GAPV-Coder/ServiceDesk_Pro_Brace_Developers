import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../modules/users/entities/user.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Ticket } from '../../modules/tickets/entities/ticket.entity';
import { TicketComment } from '../../modules/tickets/entities/ticket-comment.entity';
import { UserSeeder } from './user.seeder';
import { CategorySeeder } from './category.seeder';
import { TicketSeeder } from './ticket.seeder';
import { HashService } from '../../shared/services/hash.service';
import { TicketNumberService } from '../../shared/services/ticket-number.service';
import { DataSourceOptions } from 'typeorm';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService): DataSourceOptions => ({
                type: 'postgres',
                host: config.get<string>('DB_HOST', 'localhost'),
                port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
                username: config.get<string>('DB_USERNAME', 'postgres'),
                password: config.get<string>('DB_PASSWORD', 'postgres'),
                database: config.get<string>('DB_NAME', 'postgres'),
                entities: [User, Category, Ticket, TicketComment],
                synchronize: false, // o true solo en desarrollo
                logging: config.get<string>('NODE_ENV') === 'development',
            }),
        }),
        TypeOrmModule.forFeature([User, Category, Ticket, TicketComment]),
    ],
    providers: [
        UserSeeder,
        CategorySeeder,
        TicketSeeder,
        HashService,
        TicketNumberService,
    ],
    exports: [UserSeeder, CategorySeeder, TicketSeeder],
})

export class SeedModule { }
