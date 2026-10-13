import { Page } from "../ui/page/Page"
import { LiveInstrumentView } from "../ui/liveInstrument/LiveInstrumentView"
import { Navbar } from "../ui/page/Navbar"

export function LiveInstrumentPage() {
    return <Page>
        <Page.ConnectedTitle
            title="Live Instrument"
        />

        <Page.Body>
            <LiveInstrumentView />
        </Page.Body>

        <Page.Footer>
            <Navbar />
        </Page.Footer>
    </Page>
}
