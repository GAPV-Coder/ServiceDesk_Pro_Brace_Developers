import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

// Configuraciones
import { getDatabaseConfig } from './config/database.config';

// Modulos
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { AuditModule } from './modules/audit/audit.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

// Guards, Interceptors, Filters
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';

// Servicios
import { AuditService } from './shared/services/audit.service';
import { SLAService } from './shared/services/sla.service';
import { TicketNumberService } from './shared/services/ticket-number.service';
import { HashService } from './shared/services/hash.service';

@Module({
  imports: [
    // Configuración
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Programación para la supervisión del SLA
    ScheduleModule.forRoot(),

    // Sistema de eventos
    EventEmitterModule.forRoot(),

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    CategoriesModule,
    TicketsModule,
    AuditModule,
    DashboardModule,
  ],
  providers: [
    // Guards globales
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // Interceptors globales
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },

    // Filtros globales
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },

    // Servicios globales
    AuditService,
    SLAService,
    TicketNumberService,
    HashService,
  ],
})
export class AppService { }
