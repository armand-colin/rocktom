import { usePopupManager } from "../../hooks/usePopupManager";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { SettingsPopup } from "./SettingsPopup";

export function SettingsButton() {
    const popupManager = usePopupManager()

    function onClick() {
        popupManager.add(close => <SettingsPopup close={close} />)
    }

    return <Button
        onClick={onClick}
        shape="square"
    >
        <Icon
            name="settings"
        />
    </Button>
}
