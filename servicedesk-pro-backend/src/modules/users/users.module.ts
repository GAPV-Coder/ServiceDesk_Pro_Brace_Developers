import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { HashService } from '../../shared/services/hash.service';
import { AuditService } from '../../shared/services/audit.service';
import { AuditLog } from '../audit/entities/audit-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, AuditLog])],
    controllers: [UsersController],
    providers: [UsersService, HashService, AuditService],
    exports: [UsersService],
})
export class UsersModule { }