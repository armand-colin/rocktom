import { useNavigate } from "react-router-dom"
import { Page } from "../ui/page/Page"
import { SettingsView } from "../ui/settings/SettingsView"
import { Button } from "../ui/button/Button"
import { Icon } from "../ui/icon/Icon"
import { Routes } from "../Routes"

export function SettingsPage() {
    const navigate = useNavigate()

    return <Page>
        <Page.ConnectedTitle
            title="Settings"
            beforeActions={
                <Button
                    shape="square"
                    onClick={() => navigate(Routes.Home.compile({}))}
                >
                    <Icon name="arrow_back" />
                </Button>
            }
        />
        <Page.Body>
            <SettingsView />
        </Page.Body>
    </Page>
}
