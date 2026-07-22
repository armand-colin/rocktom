import { useState } from "react";
import { Button, ButtonTheme } from "../../button/Button";
import { Popup } from "../Popup";
import { StringInput } from "../../input/StringInput";

interface Props {
    close: () => void,
    text: string,
    defaultValue?: string,
    onConfirm: (value: string) => void,
    title?: string,
    placeholder?: string,
    confirmLabel?: string,
    cancelLabel?: string,
}

export function PromptPopup(props: Props) {
    const [value, setValue] = useState(props.defaultValue ?? "");

    return <Popup.BaseContainer>
        {
            props.title ?
                <Popup.BaseTitle
                    title={props.title}
                    close={props.close}
                /> :
                null
        }
        <p>{props.text}</p>

        <StringInput 
            value={value}
            onChange={setValue}
            autoFocus
            placeholder={props.placeholder}
        />

        <div className="flex justify-end gap-3">
            <Button
                onClick={props.close}
            >
                {props.cancelLabel || "Cancel"}
            </Button>
            <Button
                onClick={() => {
                    props.onConfirm(value)
                    props.close()
                }}
                theme={ButtonTheme.Primary}
            >
                {props.confirmLabel || "Confirm"}
            </Button>
        </div>
    </Popup.BaseContainer>
}