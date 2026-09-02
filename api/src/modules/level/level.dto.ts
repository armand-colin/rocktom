import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString, MaxLength, Min, MinLength, ValidateIf, } from "class-validator";

export class CreateLevelDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @MinLength(1, { each: true })
    instrumentTypes!: string[];
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

    @IsString()
    @ValidateIf((_, value) => value !== null)
    playbackId!: string | null;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @MinLength(1, { each: true })
    instrumentTypes!: string[];
}