import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from './auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService, private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        // Aquí usamos el payload para buscar y validar el usuario
        const user = await this.authService.getUserFromPayload(payload);
        if (!user) {
            throw new UnauthorizedException('Invalid token');
        }
        return user;
    }
}