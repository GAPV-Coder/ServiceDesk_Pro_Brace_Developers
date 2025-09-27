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

export const getJwtConfig = (): JwtModuleOptions => {
    return {
        secret: process.env.JWT_SECRET || 'defaultSecretKey',
        signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        },
    };
};