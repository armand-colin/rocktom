import { Popup } from "../popup/Popup";
import { SettingsView } from "./SettingsView";

type Props = {
    close: () => void,
}

export function SettingsPopup(props: Props) {
    return <Popup.BaseContainer className="SettingsPopup">
        <Popup.BaseTitle
            title="Settings"
            close={props.close}
        />
        <SettingsView />
    </Popup.BaseContainer>
}
