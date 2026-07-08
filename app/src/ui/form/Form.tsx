import './Form.scss'
import { useRef, type FormEvent, type KeyboardEvent, type ReactNode } from "react"
import type { FormSchema } from "../../form/FormSchema"
import type { FormHandler } from "../../form/FormHandler"
import { useComponent } from "@niloc/ecs-react"
import { OS } from '../../utils/OS'

type Props<S extends FormSchema.Schema> = {
    handler: FormHandler<S>,
    onSubmit: (result: FormHandler.Result<FormSchema<S>>) => void | Promise<void>,
    children?: ReactNode,
}

export function Form<S extends FormSchema.Schema>(props: Props<S>) {
    const { loading } = useComponent(props.handler)
    const ref = useRef<HTMLFormElement>(null)

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        props.handler.submit(e.currentTarget, props.onSubmit)
    }

    function onKeyDown(e: KeyboardEvent<HTMLFormElement>) {
        if (
            e.key === 'Enter' && 
            OS.isCtrl(e.nativeEvent)
        ) {
            e.preventDefault()
            ref.current?.requestSubmit()
        }
    }

    return <form
        onSubmit={onSubmit}
        data-loading={loading}
        className="Form"
        onKeyDown={onKeyDown}
        ref={ref}
    >
        {props.children}
    </form>
}