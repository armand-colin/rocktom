import type { ReactNode } from "react";
import { Button } from "../button/Button";

type Props = {
    close?: () => void,
    title: string,
    children: ReactNode,
}

export function Popup(props: Props) {
    return <div className="Popup">
        <div className="head">
            <h2>{props.title}</h2>
            {
                props.close ?
                    <Button onClick={props.close}>Close</Button> :
                    null
            }
        </div>
        <div className="body">
            {props.children}
        </div>
    </div>
}