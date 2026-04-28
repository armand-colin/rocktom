import { Component, Engine } from "@niloc/ecs";
import type { FormSchema } from "./FormSchema";
import { FormField, FormFieldDescriptor } from "./FormField";
import { Result } from "@niloc/utils";

export class FormHandlerParseError extends Error {
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

    private _parse(form: HTMLFormElement): Result<FormHandler.Result<FormSchema<S>>, FormHandlerParseError> {
        const json: Record<string, any> = {}
        const multipart = new FormData(form)

        const errors: Record<string, FormHandlerParseError> = {}
        
        for (const name in this.fields) {
            const field = this.fields[name]
            const value = multipart.get(name)
            const result = field.parse(value)

            if (result.ok) {
                json[name] = result.value
            } else {
                errors[name] = result.error
            }
        }

        if (Object.keys(errors).length > 0) {
            return Result.error(new FormHandlerParseError())
        }

        return Result.ok({ 
            json: json as FormHandler.Json<FormSchema<S>>, 
            multipart 
        })
    }

    async submit(form: HTMLFormElement, onSuccess: (result: FormHandler.Result<FormSchema<S>>) => void) {
        const result = this._parse(form)

        if (!result.ok) {
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