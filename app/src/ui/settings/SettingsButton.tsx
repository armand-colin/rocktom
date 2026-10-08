import { useNavigate } from "react-router-dom";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { Routes } from "../../Routes";

export function SettingsButton() {
    const navigate = useNavigate()

    return <Button
        onClick={() => navigate(Routes.Settings.compile({}))}
        shape="square"
    >
        <Icon
            name="settings"
        />
    </Button>
}
