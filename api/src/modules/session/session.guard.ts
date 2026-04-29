import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { SessionService } from './session.service';
import { Session } from './session.entity';
import { Authorization } from '../../common/authorization';

type AuthenticatedRequest = {
    headers?: {
        authorization?: string;
    };
    user?: {
        userId: string;
    };
    currentSession?: Session;
};

@Injectable()
export class SessionGuard implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const authorization = request.headers?.authorization;

        if (!authorization) {
            throw new UnauthorizedException('missing_authorization_header');
        }

        let token: string;
        try {
            token = Authorization.parseBearerToken(authorization);
        } catch {
            throw new UnauthorizedException('invalid_authorization_header');
        }

        const payload = await this.jwtService.verifyAccessToken(token);
        
        const currentSession = await this.sessionService.getValidSessionForAccess(
            payload.userId,
            payload.sessionId,
        );

        request.currentSession = currentSession;

        return true;
    }
}
