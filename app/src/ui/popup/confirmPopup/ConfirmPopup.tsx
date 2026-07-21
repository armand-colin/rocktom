import { Button } from "../../button/Button";
import { Popup } from "../Popup";

interface Props {
    close: () => void,
    text: string,
    onConfirm: () => void,
    confirmLabel?: string,
    cancelLabel?: string,
}

export function ConfirmPopup(props: Props) {
    return <Popup.BaseContainer>
        <Popup.BaseTitle
            title="Confirm"
            close={props.close}
        />
        <p>{props.text}</p>
        <div className="ConfirmPopupButtons">
            <Button
                onClick={props.close}
            >
                {props.cancelLabel || "Cancel"}
            </Button>
            <Button
                onClick={props.onConfirm}
            >
                {props.confirmLabel || "Confirm"}
            </Button>
        </div>
    </Popup.BaseContainer>
}