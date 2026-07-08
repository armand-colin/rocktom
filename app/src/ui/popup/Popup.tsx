import type { ReactNode } from "react";
import { Button } from "../button/Button";
import "./Popup.scss";
import { cn } from "../utils/cn";
import { Icon } from "../icon/Icon";
import { UiSize } from "../UiSize";

export namespace Popup {
    export function BaseContainer(props: { children?: ReactNode, className?: string }) {
        return <div className={cn("PopupBaseContainer", props.className)}>
            {props.children}
        </div>
    }

    export function BaseTitle(props: { title: string, close?: () => void }) {
        return <div className="PopupBaseTitle">
            <h3>{props.title}</h3>
            {
                props.close ?
                    <Button onClick={props.close} size={UiSize.S} shape="square">
                        <Icon name="close" />
                    </Button> :
                    null
            }
        </div>
    }
}