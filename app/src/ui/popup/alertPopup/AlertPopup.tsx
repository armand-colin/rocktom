import { Popup } from "../Popup";

export function AlertPopup(props: {
    close: () => void,
    title: string,
}) {
    return <Popup.BaseContainer>
        <Popup.BaseTitle
            title={props.title}
            close={props.close}
        />
    </Popup.BaseContainer>
}