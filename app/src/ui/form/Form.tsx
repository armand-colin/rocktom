import './Form.scss'
import type { FormEvent, ReactNode } from "react"
import type { FormSchema } from "../../form/FormSchema"
import type { FormHandler } from "../../form/FormHandler"
import { useComponent } from "@niloc/ecs-react"

type Props<S extends FormSchema.Schema> = {
    handler: FormHandler<S>,
    onSubmit: (result: FormHandler.Result<FormSchema<S>>) => void | Promise<void>,
    children?: ReactNode,
}

export function Form<S extends FormSchema.Schema>(props: Props<S>) {
    const { loading } = useComponent(props.handler)

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        props.handler.submit(e.currentTarget, props.onSubmit)
    }

    return <form
        onSubmit={onSubmit}
        data-loading={loading}
        className="Form"
    >
        {props.children}
    </form>
}