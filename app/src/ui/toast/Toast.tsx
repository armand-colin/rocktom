import { Icon, type IconName } from "../icon/Icon"
import "./Toast.scss"

export namespace Toast {

    export function Simple(props: { 
        message: string, 
        close?: () => void,
        icon?: IconName
    }) {
        return <div className="ToastSimple">
            {props.icon && <Icon name={props.icon} />}
            <p>
                {props.message}
            </p>
        </div>
    }

}
