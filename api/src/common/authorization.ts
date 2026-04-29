import { BadRequestException } from '@nestjs/common';

export namespace Authorization {
    export function parseBearerToken(authorization: string): string {
        const [scheme, token] = authorization.split(' ');

        if (scheme !== 'Bearer' || !token) {
            throw new BadRequestException('invalid_authorization_header');
        }

        return token;
    }
}
