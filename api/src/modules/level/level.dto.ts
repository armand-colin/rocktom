import { IsNotEmpty, IsNumber, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CreateLevelDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;
}
export class UpdateLevelDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;

    @IsString()
    @IsNotEmpty()
    serialized!: string;

    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    duration!: number;
}