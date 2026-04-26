import { Result } from "@niloc/utils"

type FieldDescriptor = 'string' | 'file' | ({
    type: 'string',
} & Partial<StringFieldOptions>) | ({
    type: 'file',
} & Partial<FileFieldOptions>)

export class ParseError extends Error {

}

class FormParseError<S extends FormSchema<any>> extends Error {

    readonly errors: Partial<Record<keyof ExtractSchema<S>, ParseError>>

    constructor(errors: Partial<Record<keyof ExtractSchema<S>, ParseError>>) {
        super('Form parse error')
        this.errors = errors
    }

}

const FormFieldKind = Symbol('FormFieldKind')

export abstract class FormField<F extends FormDataEntryValue, T> {

    // @ts-ignore
    private readonly [FormFieldKind]!: F

    readonly name: string

    constructor(name: string) {
        this.name = name
    }

    abstract parse(value: FormDataEntryValue | null): Result<T, ParseError>

}

type StringFieldOptions = {
    minLength: number
    maxLength: number
}

class StringField extends FormField<string, string> {

    private _options: StringFieldOptions

    constructor(name: string, options?: Partial<StringFieldOptions>) {
        super(name)

        this._options = {
            minLength: 0,
            maxLength: Infinity,
            ...options,
        }
    }

    parse(value: FormDataEntryValue): Result<string, ParseError> {
        if (typeof value !== 'string') {
            return Result.error(new ParseError(`Expected string, got ${typeof value}`))
        }

        return Result.ok(value)
    }

}

type FileFieldOptions = {
    minSize: number
    maxSize: number
}

class FileField extends FormField<File, File> {

    private _options: FileFieldOptions

    constructor(name: string, options?: Partial<FileFieldOptions>) {
        super(name)

        this._options = {
            minSize: 0,
            maxSize: Infinity,
            ...options,
        }
    }

    parse(value: FormDataEntryValue | null): Result<File, ParseError> {
        if (value === null) {
            return Result.error(new ParseError('Expected file, got null'))
        }

        if (typeof value !== 'string') {
            return Result.error(new ParseError(`Expected string, got ${typeof value}`))
        }

        return Result.ok(new File([value], value))
    }

}

type EntryType<T> = T extends 'string' ? string :
    T extends 'file' ? File :
    T extends { type: 'string' } ? string :
    T extends { type: 'file' } ? File :
    never

type ResultType<T> = T extends 'string' ? string :
    T extends 'file' ? File :
    T extends { type: 'string' } ? string :
    T extends { type: 'file' } ? File :
    never

type Fields<S extends Record<string, FieldDescriptor>> = {
    [K in keyof S]: FormField<EntryType<S[K]>, ResultType<S[K]>>
}

type JsonResult<S extends Record<string, FieldDescriptor>> = {
    [K in keyof S]: ResultType<S[K]>
}

export type ExtractSchema<S extends FormSchema<any>> = S extends FormSchema<infer T> ? T : never

export type FormResult<S extends FormSchema<any>> = {
    json: JsonResult<ExtractSchema<S>>,
    multipart: FormData
}

export type FormSchemaDescriptor = Record<string, FieldDescriptor>

export class FormSchema<T extends FormSchemaDescriptor> {

    readonly fields: Fields<T>
    private _form: HTMLFormElement | null = null

    constructor(schema: T) {
        const fields: Record<string, FormField<any, any>> = {}

        for (const name in schema) {
            const descriptor = schema[name]

            let field: FormField<any, any> | null = null

            switch (descriptor) {
                case 'string': {
                    field = new StringField(name)
                    break
                }
                case 'file': {
                    field = new StringField(name)
                    break
                }
                default: {
                    switch (descriptor.type) {
                        case 'string': {
                            field = new StringField(name, descriptor)
                            break;
                        }
                        case 'file': {
                            field = new FileField(name, descriptor)
                            break;
                        }
                    }
                }
            }

            if (field) {
                fields[name] = field
            }
        }

        this.fields = fields as Fields<T>
    }

    parse(form: HTMLFormElement): Result<FormResult<this>, FormParseError<this>> {
        const json: Record<string, any> = {}
        const multipart = new FormData(form)

        const errors: Partial<Record<keyof ExtractSchema<this>, ParseError>> = {}

        for (const name in this.fields) {
            const field = this.fields[name]
            const value = multipart.get(name)

            const result = field.parse(value)
            if (!result.ok) {
                errors[name] = result.error
            } else {
                json[name] = result.value
            }
        }

        if (Object.keys(errors).length > 0) {
            return Result.error(new FormParseError(errors))
        }

        return Result.ok({
            json: json as JsonResult<ExtractSchema<this>>,
            multipart,
        })
    }

}