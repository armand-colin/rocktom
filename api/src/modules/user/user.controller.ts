import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserDto, RegisterUserDto } from "./user.dto";
import { SessionGuard } from "../session/session.guard";
import { CurrentSession } from "../session/current-session.decorator";
import { Session } from "../session/session.entity";

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Post('register')
    register(@Body() body: RegisterUserDto): Promise<string> {
        return this.userService.register(body);
    }

    @UseGuards(SessionGuard)
    @Get('me')
    async me(@CurrentSession() session: Session): Promise<UserDto> {
        const user = await this.userService.getUserById(session.userId);

        return {
            id: user.id,
            email: user.email,
            name: user.name,
        };
    }

}