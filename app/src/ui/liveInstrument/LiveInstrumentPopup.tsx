import { Popup } from "../popup/Popup";
import { LiveInstrumentView } from "./LiveInstrumentView";

type Props = {
    close: () => void
}

export function LiveInstrumentPopup(props: Props) {
    return <Popup.BaseContainer size="sm" className="gap-4">
        <Popup.BaseTitle
            title="Live Instrument"
            close={props.close}
        />
        <Popup.BaseContent>
            <LiveInstrumentView />
        </Popup.BaseContent>
    </Popup.BaseContainer>
}
