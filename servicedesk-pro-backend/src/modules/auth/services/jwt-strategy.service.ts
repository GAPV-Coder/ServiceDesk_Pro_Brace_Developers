import { Injectable } from '@nestjs/common';
import { AuthService, JwtPayload } from './auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategyService {
    constructor(private authService: AuthService) { }

    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.authService.validateToken('');
        return user;
    }
}