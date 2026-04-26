import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from './jwt.service';
import { Session } from './session.entity';
import { UserService } from '../user/user.service';
import { MailerService } from '../mailer/mailer.service';

const SESSION_EXPIRATION_DAYS = 7;
const NUMERICS = '0123456789';

@Injectable()
export class SessionService {

    constructor(
        protected readonly userService: UserService,
        protected readonly jwtService: JwtService,
        protected readonly mailerService: MailerService,
        @InjectRepository(Session)
        protected readonly sessionRepository: Repository<Session>,
    ) {}

    async login(body: {
        email: string,
        code: string
    }) {
        const user = await this.userService.getUserByEmail(body.email);

        if (user.emailValidationCode !== body.code) {
            throw new BadRequestException('invalid_code');
        }

        // Shall create session, and return both access_token and refresh_token
        // Access token shall be set in session cookie

        const refreshTokenHash =  await crypto.randomUUID()
        const session = await this._createSession(user, refreshTokenHash);
        const tokens = await this._createTokens(user, session.id, refreshTokenHash);

        return tokens;
    }

    async code(email: string) {
        const user = await this.userService.getUserByEmail(email);

        // generate 6 digits code
        const code = Array.from({ length: 6 }, () => NUMERICS[Math.floor(Math.random() * NUMERICS.length)]).join('');

        await this.userService.setEmailValidationCode(user, code);

        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Your Rocktom login code',
            text: `Your login code is: ${code}`,
        });
    }

    async getValidSessionForAccess(userId: string, sessionId: string): Promise<Session> {
        const session = await this.sessionRepository.findOne({
            where: {
                id: sessionId,
                userId,
            },
        });

        if (!session) {
            throw new UnauthorizedException('invalid_session');
        }

        if (session.revokedAt) {
            throw new UnauthorizedException('invalid_session');
        }

        if (session.expiresAt.getTime() <= Date.now()) {
            throw new UnauthorizedException('invalid_session');
        }

        return session;
    }

    private async _createTokens(user: User, sessionId: string, refreshTokenHash: string) {
        const accessToken = await this.jwtService.signAccessToken({
            userId: user.id,
            sessionId,
        });

        const refreshToken = await this.jwtService.signRefreshToken({
            hash: refreshTokenHash,
            sessionId,
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    private async _createSession(user: User, refreshTokenHash: string) {
        const session = new Session();
        session.userId = user.id;
        session.refreshTokenHash = refreshTokenHash;
        session.expiresAt = new Date(Date.now() + SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
        
        return this.sessionRepository.save(session);
    }
}
