import type { Level } from "../../sound/Level";
import type { InstrumentTrack } from "../../sound/song/InstrumentTrack";
import { Popup } from "../popup/Popup";
import { Button } from "../button/Button";
import { InstrumentTuning, InstrumentType } from "../../sound/instrument/Instrument";


export function SelectInstrumentTrackPopup(props: {
    level: Level,
    onSelect: (track: InstrumentTrack) => void,
    close: () => void,
}) {
    function onSelect(track: InstrumentTrack) {
        props.onSelect(track)
        props.close()
    }

    return <Popup.BaseContainer>
        <Popup.BaseTitle
            title="Select instrument track"
            close={props.close}
        />
        <div className="grid gap-3">
            {
                props.level.instrumentTracks.map(track => <InstrumentTrackView
                    track={track}
                    onClick={() => onSelect(track)}
                    key={track.id}
                />)
            }
        </div>
    </Popup.BaseContainer>
}

function InstrumentTrackView(props: {
    track: InstrumentTrack,
    onClick: () => void,
}) {

    return <Button
        onClick={props.onClick}
    >
        <div className="grid place-items-start w-full">
            <span>{InstrumentType.getLabel(props.track.instrument.type)}</span>
            <p className="text-grey-300 text-body-sm">
                <small>Tuning </small>
                <span>{InstrumentTuning.getLabel(props.track.instrument.tuning)}</span>
            </p>
        </div>
    </Button>
}