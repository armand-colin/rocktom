import { useResource } from "@niloc/ecs-react";
import { AppUpdateManager } from "../../resources/AppUpdateManager";
import { Button, ButtonTheme } from "../button/Button";
import { FormInputField } from "../form/FormInputField";
import "./SettingsView.scss";

const APP_VERSION = "0.0.0"

export function SettingsView() {
    const appUpdateManager = useResource(AppUpdateManager)

    return <div className="SettingsView">
        <FormInputField label="Version">
            <span>{APP_VERSION}</span>
        </FormInputField>

        {
            appUpdateManager.needsRefresh ?
                <div className="update">
                    <p>A new version is available.</p>
                    <Button
                        theme={ButtonTheme.Primary}
                        onClick={() => appUpdateManager.applyUpdate()}
                    >
                        Update
                    </Button>
                </div> :
                <p className="upToDate">You're up to date</p>
        }
    </div>
}
