import './Form.scss'
import { useRef, type KeyboardEvent, type ReactNode, type Ref, type SubmitEvent } from "react"
import type { FormSchema } from "../../form/FormSchema"
import type { FormHandler } from "../../form/FormHandler"
import { useComponent } from "@niloc/ecs-react"
import { OS } from '../../utils/OS'
import { FormContext } from './FormContext'
import { RefUtils } from '../../utils/RefUtils'

type Props<S extends FormSchema.Schema> = {
    handler: FormHandler<S>,
    onSubmit: (result: FormHandler.Result<FormSchema<S>>) => void | Promise<void>,
    children?: ReactNode,
    className?: string,
    onChange?: () => void,
    ref?: Ref<HTMLFormElement>
}

export function Form<S extends FormSchema.Schema>(props: Props<S>) {
    const { loading } = useComponent(props.handler)
    const ref = useRef<HTMLFormElement>(null)

    function onSubmit(e: SubmitEvent<HTMLFormElement>) {
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
        className={`Form ${props.className ?? ''}`}
        onKeyDown={onKeyDown}
        ref={element => {
            ref.current = element
            RefUtils.forward(props.ref, element)
        }}
        onChange={props.onChange}
    >
        <FormContext.Provider value={{
            loading,
        }}>
            {props.children}
        </FormContext.Provider>
    </form >
}