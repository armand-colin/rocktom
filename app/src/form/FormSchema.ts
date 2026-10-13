import type { FormFieldDescriptor } from "./FormField";

export namespace FormSchema {

    export type Schema = Record<string, FormFieldDescriptor<FormDataEntryValue, any>>

}

export class FormSchema<S extends FormSchema.Schema> {

    readonly schema: S


    static default() {
        return new FormSchema({ })
    }

    static readonly Default = this.default()

    constructor(schema: S) {
        this.schema = schema
    }

}