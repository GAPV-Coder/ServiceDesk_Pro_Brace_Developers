import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesController } from './controllers/categories.controller';
import { CategoriesService } from './services/categories.service';
import { AuditService } from '../../shared/services/audit.service';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Category, AuditLog]),
        AuthModule,
    ],
    controllers: [CategoriesController],
    providers: [CategoriesService, AuditService],
    exports: [CategoriesService],
})
export class CategoriesModule { }