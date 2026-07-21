import { Icon, type IconName } from "../icon/Icon";
import { Button } from "../button/Button";
import { Popup } from "../popup/Popup";
import "./IconPopup.scss";

type IconPopupButton = {
    label: string,
    onClick?: () => void,
    disabled?: boolean,
}

type Props = {
    icon: IconName,
    text: string,
    title?: string,
    close?: () => void,
    buttons?: IconPopupButton[],
}

export function IconPopup(props: Props) {
    return <Popup.BaseContainer className="IconPopup">
        <Popup.BaseTitle
            title={props.title ?? "Information"}
            close={props.close}
        />
        
        <div className="content">
            <p>{props.text}</p>
            {
                props.buttons && props.buttons.length > 0 ?
                    <div className="actions">
                        {
                            props.buttons.map(button => <Button
                                key={button.label}
                                onClick={button.onClick}
                                disabled={button.disabled}
                            >
                                {button.label}
                            </Button>)
                        }
                    </div> :
                    null
            }
        </div>
    </Popup.BaseContainer>
}
