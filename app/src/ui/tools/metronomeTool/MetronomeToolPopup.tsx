import { useComponent, useResource } from "@niloc/ecs-react"
import { useMemo, useState } from "react"
import { MetronomeTool } from "../../../components/MetronomeTool"
import { useComponentInstance } from "../../../hooks/useComponentInstance"
import { Instance } from "../../../Instance"
import { MetronomeToolPreferences } from "../../../resources/MetronomeToolPreferences"
import { Mixer } from "../../../resources/Mixer"
import { Button, ButtonTheme } from "../../button/Button"
import { FormInputField } from "../../form/FormInputField"
import { Icon } from "../../icon/Icon"
import { NumberInput } from "../../input/NumberInput"
import { MixerChannelView } from "../../mixerView/MixerChannelView"
import { Popup } from "../../popup/Popup"
import "./MetronomeToolPopup.scss"

const MAX_TAPS = 8
const RESET_GAP_MS = 2000

type Props = {
    close: () => void
}

export function MetronomeToolPopup(props: Props) {
    const preferences = useResource(MetronomeToolPreferences)
    const mixer = Instance.engine.getResource(Mixer)
    const initialBpm = useMemo(() => preferences.bpm, [])
    const tool = useComponentInstance(MetronomeTool, initialBpm)
    const [taps, setTaps] = useState<number[]>([])

    if (!tool)
        return null

    return <MetronomeToolPopupContent
        close={props.close}
        tool={tool}
        preferences={preferences}
        mixer={mixer}
        taps={taps}
        setTaps={setTaps}
    />
}

function MetronomeToolPopupContent(props: {
    close: () => void
    tool: MetronomeTool
    preferences: MetronomeToolPreferences
    mixer: Mixer
    taps: number[]
    setTaps: (taps: number[] | ((prev: number[]) => number[])) => void
}) {
    const { playing, bpm } = useComponent(props.tool)
    const tappedBpm = estimateBpm(props.taps)

    function onBpmChange(value: number) {
        const clamped = MetronomeToolPreferences.clamp(value)
        props.tool.setBpm(clamped)
        props.preferences.bpm = clamped
        props.setTaps([])
    }

    function onTap() {
        props.tool.click()

        const now = performance.now()
        props.setTaps(prev => {
            const last = prev.at(-1)
            if (last !== undefined && now - last > RESET_GAP_MS)
                return [now]

            return [...prev, now].slice(-MAX_TAPS)
        })
    }

    function onApplyTapTempo() {
        if (tappedBpm === null)
            return

        onBpmChange(tappedBpm)
    }

    function onClose() {
        props.tool.pause()
        props.close()
    }

    return <Popup.BaseContainer
        className="MetronomeToolPopup gap-4"
        size="sm"
    >
        <Popup.BaseTitle
            title="Metronome"
            close={onClose}
        />
        <Popup.BaseContent>
            <FormInputField label="BPM">
                <NumberInput
                    name="bpm"
                    value={bpm}
                    min={MetronomeToolPreferences.minBpm}
                    max={MetronomeToolPreferences.maxBpm}
                    step={1}
                    onChange={onBpmChange}
                />
            </FormInputField>

            <FormInputField label="Volume">
                <MixerChannelView channel={props.mixer.metronome} />
            </FormInputField>

            <div className="playback">
                <Button
                    theme={ButtonTheme.Primary}
                    onClick={() => props.tool.toggle()}
                >
                    <Icon name={playing ? "pause" : "play_arrow"} />
                    {playing ? "Pause" : "Play"}
                </Button>
            </div>

            <div className="tap-tempo">
                <div className="bpm">
                    {tappedBpm !== null ? `${tappedBpm}` : "—"}
                    <span className="unit">tap BPM</span>
                </div>

                <Button
                    className="tap"
                    theme={ButtonTheme.Primary}
                    onClick={onTap}
                >
                    Tap
                </Button>

                <div className="actions">
                    <Button
                        onClick={() => props.setTaps([])}
                        disabled={props.taps.length === 0}
                    >
                        Reset
                    </Button>
                    <Button
                        theme={ButtonTheme.Primary}
                        onClick={onApplyTapTempo}
                        disabled={tappedBpm === null}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        </Popup.BaseContent>
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
    return MetronomeToolPreferences.clamp(bpm)
}
