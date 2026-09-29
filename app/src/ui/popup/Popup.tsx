import type { ReactNode } from "react";
import { Button } from "../button/Button";
import "./Popup.scss";
import { cn } from "../utils/cn";
import { Icon } from "../icon/Icon";
import { UiSize } from "../UiSize";
import { Enum } from "@niloc/utils";

export const PopupSize = Enum.create({
    Small: "small",
    Medium: "medium",
    Large: "large",
})

export type PopupSize = Enum.Infer<typeof PopupSize>

export namespace Popup {

    export function BaseContainer(props: { children?: ReactNode, className?: string, size?: PopupSize }) {
        return <div
            className={cn("PopupBaseContainer", props.className)}
            onClick={(e) => e.stopPropagation()}
            data-size={props.size}
        >
            {props.children}
        </div>
    }

    export function BaseContent(props: { children?: ReactNode, className?: string }) {
        return <div className={cn("PopupBaseContent", props.className)}>
            {props.children}
        </div>
    }

    export function BaseTitle(props: { title: string, close?: () => void }) {
        return <div className="PopupBaseTitle">
            <h3>{props.title}</h3>
            {
                props.close ?
                    <Button
                        onClick={props.close}
                        size={UiSize.S}
                        shape="square"
                        variant="ghost"
                    >
                        <Icon name="close" />
                    </Button> :
                    null
            }
        </div>
    }

    export function BaseButtons(props: { children?: ReactNode }) {
        return <div className="PopupBaseButtons">
            {props.children}
        </div>
    }

}