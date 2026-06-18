import type { ReactNode } from "react";
import { Button } from "../button/Button";

type Props = {
    close?: () => void,
    children: ReactNode,
}

export function Toast(props: Props) {
    return <div className="ToastContent">
        <div className="body">
            {props.children}
        </div>
        {
            props.close ?
                <Button onClick={props.close} data-size="s">Close</Button> :
                null
        }
    </div>
}
