import { useState } from "react"
import type { EditorPlayer } from "../../../components/editor/EditorPlayer"
import type { TempoTrackEditor } from "../../../components/editor/TempoTrackEditor"
import { Button, ButtonTheme } from "../../button/Button"
import { Popup } from "../../popup/Popup"
import "./TapTempoPopup.scss"

const MAX_TAPS = 8
const RESET_GAP_MS = 2000
const MIN_BPM = 40
const MAX_BPM = 240

export function TapTempoPopup(props: {
    close: () => void
    tempoTrack: TempoTrackEditor
    player: EditorPlayer
}) {
    const [taps, setTaps] = useState<number[]>([])
    const bpm = estimateBpm(taps)

    function onTap() {
        props.player.metronome.click()

        const now = performance.now()
        setTaps(prev => {
            const last = prev.at(-1)
            if (last !== undefined && now - last > RESET_GAP_MS)
                return [now]

            return [...prev, now].slice(-MAX_TAPS)
        })
    }

    function onReset() {
        setTaps([])
    }

    function onSetInitial() {
        if (bpm === null)
            return

        props.tempoTrack.setInitial(bpm)
        props.close()
    }

    return <Popup.BaseContainer className="TapTempoPopup">
        <Popup.BaseTitle title="Tap tempo" close={props.close} />

        <div className="bpm">
            {bpm !== null ? `${bpm}` : "—"}
            <span className="unit">BPM</span>
        </div>

        <Button
            className="tap"
            theme={ButtonTheme.Primary}
            onClick={onTap}
        >
            Tap
        </Button>

        <div className="actions">
            <Button onClick={onReset} disabled={taps.length === 0}>
                Reset
            </Button>

            <Button
                theme={ButtonTheme.Primary}
                onClick={onSetInitial}
                disabled={bpm === null}
            >
                Set as initial BPM
            </Button>
        </div>
    </Popup.BaseContainer>
}

function estimateBpm(taps: number[]): number | null {
    if (taps.length < 2)
        return null

    let total = 0
    for (let i = 1; i < taps.length; i++)
        total += taps[i] - taps[i - 1]

    const avgIntervalMs = total / (taps.length - 1)
    const bpm = Math.round(60_000 / avgIntervalMs)
    return Math.min(MAX_BPM, Math.max(MIN_BPM, bpm))
}
