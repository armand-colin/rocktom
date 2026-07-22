import { Button, ButtonTheme } from "../../button/Button";
import { Popup } from "../Popup";

interface Props {
    close: () => void,
    text: string,
    onConfirm: () => void,
    title?: string,
    confirmLabel?: string,
    cancelLabel?: string,
    theme?: 'default' | 'danger'
}

export function ConfirmPopup(props: Props) {
    const theme = props.theme || 'default'

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
        <div className="flex justify-end gap-3">
            <Button
                onClick={props.close}
            >
                {props.cancelLabel || "Cancel"}
            </Button>
            <Button
                onClick={() => {
                    props.onConfirm()
                    props.close()
                }}
                theme={theme === 'danger' ? ButtonTheme.Danger : ButtonTheme.Primary}
            >
                {props.confirmLabel || "Confirm"}
            </Button>
        </div>
    </Popup.BaseContainer>
}