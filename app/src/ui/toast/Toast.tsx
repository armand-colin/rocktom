import { Icon, type IconName } from "../icon/Icon"
import { Button, ButtonTheme } from "../button/Button"
import { UiSize } from "../UiSize"
import "./Toast.scss"
import type { ReactNode } from "react"

export namespace Toast {

    export function Simple(props: { 
        message: string, 
        close?: () => void,
        icon?: IconName,
        action?: {
            label: string,
            onClick: () => void,
        }
    }) {
        return <div className="ToastSimple">
            {props.icon && <Icon name={props.icon} />}
            <p>
                {props.message}
            </p>
            {props.action && <Button
                type="button"
                size={UiSize.Small}
                theme={ButtonTheme.Primary}
                onClick={props.action.onClick}
            >
                {props.action.label}
            </Button>}
        </div>
    }

    export function Custom(props: {
        children?: ReactNode
    }) {
        return <div className="ToastCustom">
            {props.children}
        </div>
    }

}
