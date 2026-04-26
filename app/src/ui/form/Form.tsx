import type { FormEvent, ReactNode } from "react"
import type { FormResult, FormSchema } from "../../form/FormSchema"
import type { FormHandler } from "../../form/FormHandler"

type Props<S extends FormSchema<any>> = {
    handler: FormHandler<S>,
    onSubmit: (result: FormResult<S>) => void | Promise<void>,
    children?: ReactNode,
}

export function Form<S extends FormSchema<any>>(props: Props<S>) {
    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        props.handler.submit(e.currentTarget, props.onSubmit)
    }

    return <form onSubmit={onSubmit}>
        {props.children}
    </form>
}