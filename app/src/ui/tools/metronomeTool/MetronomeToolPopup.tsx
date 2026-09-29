import { useComponent, useResource } from "@niloc/ecs-react"
import { useMemo, useRef } from "react"
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

    if (!tool)
        return null

    return <MetronomeToolPopupContent
        close={props.close}
        tool={tool}
        preferences={preferences}
        mixer={mixer}
    />
}

function MetronomeToolPopupContent(props: {
    close: () => void
    tool: MetronomeTool
    preferences: MetronomeToolPreferences
    mixer: Mixer
}) {
    const { playing, bpm } = useComponent(props.tool)
    const taps = useRef<number[]>([])

    function onTap() {
        props.tool.click()

        const now = performance.now()

        const last = taps.current.at(-1)
        if (last && now - last > RESET_GAP_MS) {
            taps.current = [now]
        } else {
            taps.current = [...taps.current, now].slice(-MAX_TAPS)
        }

        if (taps.current.length >= 2) {
            const bpm = estimateBpm(taps.current)
            if (bpm) {
                props.tool.setBpm(bpm)
                props.preferences.bpm = bpm
            }
        }
    }

    function onAddBpm(value: number) {
        const clamped = MetronomeToolPreferences.clamp(bpm + value)
        props.tool.setBpm(clamped)
        props.preferences.bpm = clamped
        taps.current = []
    }

    function onBpmChange(value: number) {
        // Shall check if input is valid
        console.log(value)
        const clamped = MetronomeToolPreferences.clamp(value)
        props.tool.setBpm(clamped)
        props.preferences.bpm = clamped
        taps.current = []
    }

    return <Popup.BaseContainer
        className="MetronomeToolPopup gap-4"
        size="sm"
    >
        <Popup.BaseTitle
            title="Metronome"
            close={props.close}
        />
        <Popup.BaseContent gap={5}>
            <FormInputField label="BPM">
                <div className="flex gap-2">
                    <Button
                        shape="square"
                        onClick={() => onAddBpm(-1)}
                        theme="primary"
                        disabled={bpm === MetronomeToolPreferences.minBpm}
                    >
                        <Icon name="remove" />
                    </Button>
                    <NumberInput
                        hideSlider
                        name="bpm"
                        value={bpm}
                        min={MetronomeToolPreferences.minBpm}
                        max={MetronomeToolPreferences.maxBpm}
                        step={1}
                        onChange={onBpmChange}
                        className="flex-1"
                        inputClassName="text-center"
                    />
                    <Button
                        shape="square"
                        onClick={() => onAddBpm(1)}
                        theme="primary"
                        disabled={bpm === MetronomeToolPreferences.maxBpm}
                    >
                        <Icon name="add" />
                    </Button>
                </div>
            </FormInputField>

            <FormInputField label="Volume">
                <MixerChannelView channel={props.mixer.metronome} />
            </FormInputField>

            <Button
                theme={ButtonTheme.Primary}
                onClick={() => props.tool.toggle()}
                className="w-full"
            >
                <Icon name={playing ? "pause" : "play_arrow"} />
                {playing ? "Pause" : "Play"}
            </Button>

            <Button
                className="h-20 items-center"
                onClick={onTap}
            >
                Tap
            </Button>
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
