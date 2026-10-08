import { Page } from "../ui/page/Page"
import { SettingsView } from "../ui/settings/SettingsView"
import { Navbar } from "../ui/page/Navbar"

export function SettingsPage() {
    return <Page>
        <Page.ConnectedTitle
            title="Settings"
        />

        <Page.Body>
            <SettingsView />
        </Page.Body>

        <Page.Footer>
            <Navbar />
        </Page.Footer>
    </Page>
}
