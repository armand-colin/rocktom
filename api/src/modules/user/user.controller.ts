import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { RegisterUserDto } from "./user.dto";

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Post('register')
    register(@Body() body: RegisterUserDto): Promise<string> {
        return this.userService.register(body);
    }

}