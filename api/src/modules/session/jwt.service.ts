import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { AppConfigService } from '../../config/config.service';

type AccessTokenPayload = {
    userId: string;
    sessionId: string;
}

type RefreshTokenPayload = {
    hash: string;
    sessionId: string;
}

@Injectable()
export class JwtService {

    private readonly _secret: string;

    constructor(config: AppConfigService) {
        this._secret = config.jwtSecret;
    }

    async signAccessToken(payload: AccessTokenPayload) {
        return jwt.sign(
            {
                sid: payload.sessionId,
            }, 
            this._secret, 
            { 
                expiresIn: '15m',
                subject: payload.userId,
            }
        );
    }

    async signRefreshToken(payload: RefreshTokenPayload) {
        return jwt.sign(
            {
                hash: payload.hash,
                sid: payload.sessionId,
            }, 
            this._secret, 
            { 
                expiresIn: '7d' 
            }
        );
    }

    async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
        try {
            const decoded = jwt.verify(token, this._secret);

            if (typeof decoded === 'string') {
                throw new UnauthorizedException('invalid_session');
            }

            if (!decoded.sub || typeof decoded.sub !== 'string') {
                throw new UnauthorizedException('invalid_session');
            }

            if (!decoded.sid || typeof decoded.sid !== 'string') {
                throw new UnauthorizedException('invalid_session');
            }

            return {
                userId: decoded.sub,
                sessionId: decoded.sid,
            };
        } catch {
            throw new UnauthorizedException('invalid_session');
        }
    }

    async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
        try {
            const decoded = jwt.verify(token, this._secret);

            if (typeof decoded === 'string') {
                throw new UnauthorizedException('invalid_session');
            }

            if (!decoded.hash || typeof decoded.hash !== 'string') {
                throw new UnauthorizedException('invalid_session');
            }

            if (!decoded.sid || typeof decoded.sid !== 'string') {
                throw new UnauthorizedException('invalid_session');
            }

            return {
                hash: decoded.hash,
                sessionId: decoded.sid,
            };
        } catch {
            throw new UnauthorizedException('invalid_session');
        }
    }

}