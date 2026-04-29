import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session.service';
import { CodeDto, LoginDto } from './session.dto';
import { Authorization } from '../../common/authorization';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

@Controller('session')
export class SessionController {
    
    constructor(protected readonly sessionService: SessionService) {}

    @Post('login')
    login(@Body() body: LoginDto) {
        return this.sessionService.login(body);
    }

    @Post('code')
    code(@Body() body: CodeDto) {
        return this.sessionService.code(body.username);
    }

    @Post('refresh')
    refresh(
        @Headers('authorization') authorization?: string,
        @Headers('cookie') cookieHeader?: string,
    ) {
        const refreshToken = this._extractRefreshToken(authorization, cookieHeader);
        return this.sessionService.refresh(refreshToken);
    }

    private _extractRefreshToken(authorization?: string, cookieHeader?: string): string {
        if (authorization) {
            return Authorization.parseBearerToken(authorization);
        }

        const refreshToken = this._parseCookie(cookieHeader, REFRESH_TOKEN_COOKIE_NAME);

        if (!refreshToken) {
            throw new UnauthorizedException('missing_refresh_token');
        }

        return refreshToken;
    }

    private _parseCookie(cookieHeader: string | undefined, name: string): string | null {
        if (!cookieHeader) {
            return null;
        }

        const cookies = cookieHeader.split(';');
        for (const cookie of cookies) {
            const [rawName, ...rawValueParts] = cookie.trim().split('=');
            if (!rawName || rawValueParts.length === 0) {
                continue;
            }

            if (rawName !== name) {
                continue;
            }

            const rawValue = rawValueParts.join('=');
            try {
                return decodeURIComponent(rawValue);
            } catch {
                return rawValue;
            }
        }

        return null;
    }
}
