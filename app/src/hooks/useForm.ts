import { FormHandler } from "../form/FormHandler"
import type { FormSchema } from "../form/FormSchema"
import { useComponentInstance } from "./useComponentInstance"

export function useForm<S extends FormSchema<any>>(schema: S): FormHandler<S> {
    const handler = useComponentInstance(FormHandler, schema)
    return handler
}