import { Body, Controller, Headers, Post, Req, Request, Res, Response, UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session.service';
import { CodeDto, LoginDto } from './session.dto';
import { Authorization } from '../../common/authorization';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

@Controller('session')
export class SessionController {
    
    constructor(protected readonly sessionService: SessionService) {}

    @Post('login')
    async login(
        @Body() body: LoginDto,
        @Res({ passthrough: true }) response: ExpressResponse,
    ) {
        const tokens = await this.sessionService.login(body);
        this._setCookie(response, tokens.refreshToken);
        await response.send(tokens);
    }

    @Post('logout')
    async logout(
        @Res({ passthrough: true }) response: ExpressResponse,
    ) {
        response.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
        await response.send({ message: 'Logged out successfully' });
    }

    @Post('code')
    code(@Body() body: CodeDto) {
        return this.sessionService.code(body.username);
    }

    @Post('refresh')
    async refresh(
        @Res({ passthrough: true }) response: ExpressResponse,
        @Req() request: ExpressRequest,
        @Headers('authorization') authorization?: string,
    ) {
        const refreshCookie = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
        const refreshToken = this._extractRefreshToken(authorization, refreshCookie);

        const tokens = await this.sessionService.refresh(refreshToken);

        this._setCookie(response, tokens.refreshToken);

        await response.send(tokens);
    }

    private _extractRefreshToken(authorization?: string, refreshCookie?: string): string {
        if (authorization) {
            return Authorization.parseBearerToken(authorization);
        }

        if (!refreshCookie) {
            throw new UnauthorizedException('missing_refresh_token');
        }

        return refreshCookie;
    }

    private _setCookie(response: ExpressResponse, refreshToken: string) {
        response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
            httpOnly: true,
            secure: false, // TODO: Change to true in production
            sameSite: 'lax',
        });
    }

}
