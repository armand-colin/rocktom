import {
    IsEmail,
    IsNotEmpty,
    IsString,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    Validate,
    isEmail,
} from "class-validator";

@ValidatorConstraint({ name: 'isNotEmail', async: false })
class IsNotEmailConstraint implements ValidatorConstraintInterface {
    validate(value: unknown): boolean {
        if (typeof value !== 'string') {
            return false;
        }
        return !isEmail(value);
    }

    defaultMessage(_validationArguments?: ValidationArguments): string {
        return 'name_cannot_be_email';
    }
}

export class RegisterUserDto {

    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    @Validate(IsNotEmailConstraint)
    name!: string;

}

export class UserDto {

    id!: string;
    email!: string;
    name!: string;

}