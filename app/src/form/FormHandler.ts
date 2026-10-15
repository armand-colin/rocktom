import { Component, Engine } from "@niloc/ecs";
import type { FormSchema } from "./FormSchema";
import { FormField, FormFieldDescriptor, type ParseError } from "./FormField";
import { Result } from "@niloc/utils";

export class FormHandlerParseError extends Error {

    readonly errors: Record<string, ParseError>

    constructor(errors: Record<string, ParseError>) {
        super()
        this.errors = errors
    }

}

export namespace FormHandler {
    export type Fields<S extends FormSchema.Schema> = {
        [K in keyof S]: FormField<
            FormField.Descriptor.FormDataEntryValue<S[K]>,
            FormField.Descriptor.Value<S[K]>
        >
    }

    export type Json<S extends FormSchema<any>> = S extends FormSchema<infer SS> ? { 
        [K in keyof SS]: SS[K] extends FormFieldDescriptor<infer _F, infer T> ? T : never 
    } : never;

    export type Result<S extends FormSchema<any>> = {
        json: Json<S>,
        multipart: FormData;
    }

}

export class FormHandler<S extends FormSchema.Schema> extends Component {

    readonly fields: FormHandler.Fields<S>

    private _form: HTMLFormElement | null = null
    private _loading = false

    constructor(engine: Engine, schema: FormSchema<S>) {
        super(engine)

        const fields: Record<string, FormField<FormDataEntryValue, any>> = {}

        for (const name in schema.schema) {
            const descriptor = schema.schema[name]
            fields[name] = new FormField(engine, name, descriptor)
        }

        this.fields = fields as FormHandler.Fields<S>
    }

    get loading() {
        return this._loading
    }

    attach(form: HTMLFormElement | null) {
        this._form = form
    }

    requestSubmit() {
        if (this._loading)
            return

        this._form?.requestSubmit()
    }

    clear() {
        for (const name in this.fields)
            this.fields[name].clear()
    }

    reset() {
        this._form?.reset()
    }

    read(): Result<FormHandler.Result<FormSchema<S>>, FormHandlerParseError> {
        if (!this._form)
            return Result.error(new FormHandlerParseError({}))

        return this._parse(this._form)
    }

    private _parse(form: HTMLFormElement): Result<FormHandler.Result<FormSchema<S>>, FormHandlerParseError> {
        const json: Record<string, any> = {}
        const multipart = new FormData(form)

        const errors: Record<string, ParseError> = {}
        
        for (const name in this.fields) {
            const field = this.fields[name]
            const value = multipart.get(name)
            const result = field.read(value)

            if (result.ok) {
                json[name] = result.value
            } else {
                errors[name] = result.error
            }
        }

        if (Object.keys(errors).length > 0) {
            return Result.error(new FormHandlerParseError(errors))
        }

        return Result.ok({ 
            json: json as FormHandler.Json<FormSchema<S>>, 
            multipart 
        })
    }

    private _focusFirstInvalid(errors: Record<string, ParseError>) {
        for (const name in this.fields) {
            if (name in errors) {
                this.fields[name].focus()
                return
            }
        }
    }

    async submit(form: HTMLFormElement, onSuccess: (result: FormHandler.Result<FormSchema<S>>) => void) {
        if (this._loading)
            return

        const result = this._parse(form)

        if (!result.ok) {
            this._focusFirstInvalid(result.error.errors)
            this.changed()
        } else {
            this._loading = true
            this.changed()

            try {
                await onSuccess(result.value)
            } catch (e) { }

            this._loading = false
            this.changed()
        }
    }

}