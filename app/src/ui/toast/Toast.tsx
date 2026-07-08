import "./Toast.scss"

export namespace Toast {

    export function Simple(props: { message: string, close?: () => void }) {
        return <div className="ToastSimple">
            <p>{props.message}</p>
        </div>
    }

}
