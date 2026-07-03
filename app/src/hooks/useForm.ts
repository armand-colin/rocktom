import { useComponent } from "@niloc/ecs-react";
import { FormHandler } from "../form/FormHandler"
import type { FormSchema } from "../form/FormSchema"
import { Instance } from "../Instance"
import { useEffect, useMemo } from "react";

export function useForm<S extends FormSchema.Schema>(schema: FormSchema<S>): FormHandler<S> {
    const handler = useMemo(() => {
        const handler = Instance.engine.createComponent(FormHandler, schema);
        return handler
    }, [schema])
    
    useEffect(() => {
        return () => {
            handler.destroy()
        }
    }, [handler])

    return useComponent(handler)
}