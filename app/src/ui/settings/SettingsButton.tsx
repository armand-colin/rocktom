import { useNavigate } from "react-router-dom";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";

export function SettingsButton() {
    const navigate = useNavigate()

    return <Button
        onClick={() => navigate("/settings")}
        shape="square"
    >
        <Icon
            name="settings"
        />
    </Button>
}
