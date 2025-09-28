import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

interface JwtSignOptions {
    expiresIn: string;
}

interface JwtConfig {
    secret: string;
    signOptions: JwtSignOptions;
}

interface Config {
    jwt: JwtConfig;
}

export const getJwtConfig = async (configService: ConfigService): Promise<JwtModuleOptions> => ({
    secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
    signOptions: { expiresIn: 'JWT_EXPIRES_IN' },
});