import { FormHandler } from "../form/FormHandler"
import type { FormSchema } from "../form/FormSchema"
import { useComponentInstance } from "./useComponentInstance"

export function useForm<S extends FormSchema.Schema>(schema: FormSchema<S>): FormHandler<S> {
    return useComponentInstance(FormHandler, schema)
}