import { Component, Engine } from "@niloc/ecs";
import type { ExtractSchema, FormResult, FormSchema, ParseError } from "./FormSchema";
import { Result } from "@niloc/utils";

export class FormHandler<S extends FormSchema<any>> extends Component {

    readonly schema: S

    private _errors: Partial<Record<keyof ExtractSchema<S>, ParseError>> = {}
    private _loading = false

    constructor(engine: Engine, schema: S) {
        super(engine)
        this.schema = schema;
    }

    get errors() {
        return this._errors
    }

    async submit(form: HTMLFormElement, onSuccess: (result: FormResult<S>) => void) {
        const result = this.schema.parse(form)

        if (!result.ok) {
            this._errors = result.error.errors
            this.changed()
        } else {
            this._errors = {}
            this._loading = true
            this.changed()

            try {
                await onSuccess(result.value)
            } catch(e) { }

            this._loading = false
            this.changed()
        }
    }

}