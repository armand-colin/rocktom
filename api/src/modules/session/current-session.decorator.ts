import { createParamDecorator, ExecutionContext, InternalServerErrorException, Logger } from '@nestjs/common';
import { Session } from './session.entity';

type SessionRequest = {
    currentSession?: Session;
};

const logger = new Logger('CurrentSession');

export const CurrentSession = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): Session => {
        const request = ctx.switchToHttp().getRequest<SessionRequest>();
        const currentSession = request.currentSession;

        if (!currentSession) {
            logger.error('Missing current session context. Please check if the decorator has been applied to the request. ' + ctx.getClass().name + '.' + ctx.getHandler().name);
            throw new InternalServerErrorException('missing_current_session_context');
        }

        return currentSession;
    },
);
