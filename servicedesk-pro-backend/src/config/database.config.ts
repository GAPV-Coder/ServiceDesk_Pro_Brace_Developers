import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
    configService: ConfigService,
): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', process.env.DB_HOST || 'localhost'),
    port: configService.get<number>('DB_PORT', process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432),
    username: configService.get<string>('DB_USERNAME', process.env.DB_USERNAME || 'postgres'),
    password: configService.get<string>('DB_PASSWORD', process.env.DB_PASSWORD || 'postgres'),
    database: configService.get<string>('DB_NAME', process.env.DB_NAME || 'postgres'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    logging: configService.get<string>('NODE_ENV') === 'development',
    ssl:
        configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
});
