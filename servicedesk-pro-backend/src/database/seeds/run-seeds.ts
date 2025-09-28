import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedModule } from './seed.module';
import { UserSeeder } from './user.seeder';
import { CategorySeeder } from './category.seeder';
import { TicketSeeder } from './ticket.seeder';
import { getDatabaseConfig } from '../../config/database.config';
import { HashService } from '../../shared/services/hash.service';
import { TicketNumberService } from '../../shared/services/ticket-number.service';
import { User } from '../../modules/users/entities/user.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Ticket } from '../../modules/tickets/entities/ticket.entity';
import { TicketComment } from '../../modules/tickets/entities/ticket-comment.entity';

async function bootstrap() {
    console.log('🌱 Starting database seeding...');

    // Crear un contexto de aplicación mínimo para la inicialización
    const app = await NestFactory.createApplicationContext(
        SeedDynamicModule.forRoot([
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            TypeOrmModule.forRootAsync({
                imports: [ConfigModule],
                useFactory: getDatabaseConfig,
                inject: [ConfigService],
            }),
        ]),
    );

    try {
        // Ejecutar seeders en orden
        console.log('👥 Seeding users...');
        const userSeeder = app.get(UserSeeder);
        await userSeeder.seed();
        console.log('✅ Users seeded');

        console.log('📋 Seeding categories...');
        const categorySeeder = app.get(CategorySeeder);
        await categorySeeder.seed();
        console.log('✅ Categories seeded');

        console.log('🎫 Seeding tickets...');
        const ticketSeeder = app.get(TicketSeeder);
        await ticketSeeder.seed();
        console.log('✅ Tickets seeded');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📧 Default user credentials:');
        console.log('Manager: manager@servicedesk.com / password123');
        console.log('Agent: agent1@servicedesk.com / password123');
        console.log('User: user1@company.com / password123');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

// Módulo Seed fijo para el arranque
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const SeedDynamicModule = {
    forRoot: (imports: any[]): DynamicModule => ({
        module: SeedModuleClass,
        imports: [
            ...imports,
            TypeOrmModule.forFeature([
                User,
                Category,
                Ticket,
                TicketComment,
            ]),
        ],
        providers: [
            UserSeeder,
            CategorySeeder,
            TicketSeeder,
            HashService,
            TicketNumberService,
        ],
        exports: [UserSeeder, CategorySeeder, TicketSeeder],
    }),
};

class SeedModuleClass { }

bootstrap();