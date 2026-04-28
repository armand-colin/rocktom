import type { FormFieldDescriptor } from "./FormField";

export namespace FormSchema {

    export type Schema = Record<string, FormFieldDescriptor<FormDataEntryValue, any>>

}

export class FormSchema<S extends FormSchema.Schema> {

    readonly schema: S

    constructor(schema: S) {
        this.schema = schema
    }

}