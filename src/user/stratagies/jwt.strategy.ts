import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class TwoFactorStrategy extends PassportStrategy(Strategy, 'two-factor') {
    constructor(private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        // if (!payload.isTempToken) {
        //     throw new UnauthorizedException('Invalid token type for 2FA verification');
        // }

        const user = await this.userService.findUserById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // if (!user.is2FAEnabled) {
        //     throw new UnauthorizedException('2FA not enabled for this user');
        // }

        return user;
    }
}