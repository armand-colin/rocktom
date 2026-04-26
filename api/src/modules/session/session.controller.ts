import { Body, Controller, Post } from '@nestjs/common';
import { SessionService } from './session.service';
import { CodeDto, LoginDto } from './session.dto';

@Controller('session')
export class SessionController {
    
    constructor(protected readonly sessionService: SessionService) {}

    @Post('login')
    login(@Body() body: LoginDto) {
        return this.sessionService.login(body);
    }

    @Post('code')
    code(@Body() body: CodeDto) {
        return this.sessionService.code(body.email);
    }
}
