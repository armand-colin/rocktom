import { usePopupManager } from "../../hooks/usePopupManager";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { ProfilePopup } from "./ProfilePopup";

export function ProfileButton() {
    const popupManager = usePopupManager()

    function onClick() {
        popupManager.add(close => <ProfilePopup close={close} />)
    }

    return <Button
        onClick={onClick}
        shape="square"
    >
        <Icon
            name="account_circle"
        />
    </Button>
}
