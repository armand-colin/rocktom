import type { ReactNode } from "react";
import { Button } from "../button/Button";
import "./Popup.scss";
import { cn } from "../utils/cn";

export namespace Popup {
    export function BaseContainer(props: { children?: ReactNode, className?: string }) {
        return <div className={cn("PopupBaseContainer", props.className)}>
            {props.children}
        </div>
    }

    export function BaseTitle(props: { title: string, close?: () => void }) {
        return <div className="PopupBaseTitle">
            <h2>{props.title}</h2>
            {
                props.close ?
                    <Button onClick={props.close}>Close</Button> :
                    null
            }
        </div>
    }
}