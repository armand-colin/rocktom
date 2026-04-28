import { Component, Engine } from "@niloc/ecs";
import { Result } from "@niloc/utils";

export class ParseError extends Error {


}

export class TypeParseError extends ParseError {

}

export class NullParseError extends ParseError {

}

export class ValueParseError extends ParseError {
}

export abstract class FormFieldDescriptor<F extends FormDataEntryValue, T> {

    abstract parse(value: FormDataEntryValue | null): Result<T, ParseError>
    optional(): FormFieldDescriptor<F, T | null> {
        return new OptionalFieldDescriptor(this)
    }

}

export type StringFieldOptions = {
    minLength: number
    maxLength: number
}

export class StringFieldDescriptor extends FormFieldDescriptor<string, string> {

    protected readonly options: StringFieldOptions

    constructor(options?: Partial<StringFieldOptions>) {
        super()

        this.options = {
            minLength: 0,
            maxLength: Infinity,
            ...options,
        }
    }

    parse(value: FormDataEntryValue | null): Result<string, ParseError> {
        if (typeof value !== 'string') {
            return Result.error(new TypeParseError())
        }
        if (value === null) {
            return Result.error(new NullParseError())
        }
        return Result.ok(value)
    }

    min(length: number): StringFieldDescriptor {
        return new StringFieldDescriptor({
            ...this.options,
            minLength: length,
        })
    }

    max(length: number): StringFieldDescriptor {
        return new StringFieldDescriptor({
            ...this.options,
            maxLength: length,
        })
    }

}

export class EmailFieldDescriptor extends FormFieldDescriptor<string, string> {

    parse(value: FormDataEntryValue | null): Result<string, ParseError> {
        if (typeof value !== 'string') {
            return Result.error(new TypeParseError())
        }
        if (value === null) {
            return Result.error(new NullParseError())
        }

        // Try match email regex
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)) {
            return Result.error(new ValueParseError())
        }

        return Result.ok(value)
    }

}

export class OptionalFieldDescriptor<F extends FormDataEntryValue, T> extends FormFieldDescriptor<F, T | null> {

    private readonly _inner: FormFieldDescriptor<F, T>

    constructor(inner: FormFieldDescriptor<F, T>) {
        super()
        this._inner = inner
    }

    parse(value: FormDataEntryValue | null): Result<T | null, ParseError> {
        if (value === null) {
            return Result.ok(null)
        }

        return this._inner.parse(value)
    }

}

export type FileFieldOptions = {
    
}

export class FileFieldDescriptor extends FormFieldDescriptor<File, File> {

    protected readonly options: FileFieldOptions

    constructor(options?: Partial<FileFieldOptions>) {
        super()
        this.options = {
            ...options,
        }
    }

    parse(value: FormDataEntryValue | null): Result<File, ParseError> {
        if (!(value instanceof File)) {
            return Result.error(new TypeParseError())
        }

        if (value === null) {
            return Result.error(new NullParseError())
        }

        return Result.ok(value)
    }

}

export class FormField<F extends FormDataEntryValue, T> extends Component {

    readonly name: string

    private readonly _descriptor: FormFieldDescriptor<F, T>

    constructor(engine: Engine, name: string, descriptor: FormFieldDescriptor<FormDataEntryValue, T>) {
        super(engine)
        this.name = name
        this._descriptor = descriptor
    }

    parse(value: FormDataEntryValue | null): Result<T, ParseError> {
        return this._descriptor.parse(value)
    }

}

export namespace FormField {

    export function string() {
        return new StringFieldDescriptor()
    }

    export function email() {
        return new EmailFieldDescriptor()
    }

    export function file() {
        return new FileFieldDescriptor()
    }

    export namespace Descriptor {
        export type FormDataEntryValue<T> = T extends FormFieldDescriptor<infer F, infer _T> ? F : never
        export type Value<T> = T extends FormFieldDescriptor<infer _F, infer T> ? T : never
    }

    export type Value<T> = T extends FormField<infer _F, infer T> ? T : never
    export type FormDataEntryValue<T> = T extends FormField<infer F, infer _T> ? F : never

}
