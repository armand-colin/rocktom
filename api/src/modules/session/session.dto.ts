import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @IsNotEmpty()
    code!: string
}

export class CodeDto {
    @IsString()
    @IsNotEmpty()
    username!: string;
}