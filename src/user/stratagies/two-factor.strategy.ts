import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        const user = await this.userService.findUserById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('Invalid access token');
        }

        // If route requires 2FA, check if verified
        if (payload.twoFAEnabled && !payload.twoFAVerified) {
            throw new UnauthorizedException('2FA verification required');
        }

        return user;
    }
}