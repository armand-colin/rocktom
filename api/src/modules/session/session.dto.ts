import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    code!: string
}

export class CodeDto {
    @IsEmail()
    email!: string;
}