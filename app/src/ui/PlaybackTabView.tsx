import { useMemo, type CSSProperties, type PointerEvent } from "react"
import type { Playback } from "../components/Playback"
import type { ChordEvent, PlaybackTabRenderer } from "../playback/PlaybackTabRenderer"
import { Button } from "./button/Button"
import { Tempo } from "../sound/Tempo"
import "./PlaybackTabView.scss"
import type { Time } from "../components/Time"
import { useComponent } from "../hooks/useComponent"
import { Icon } from "./icon/Icon"
import { MixerChannelView } from "./mixerView/MixerChannelView"
import { useResource } from "@niloc/ecs-react"
import { Mixer } from "../resources/Mixer"
import { FormInputField } from "./form/FormInputField"
import { useShortcut } from "../hooks/useShortcut"
import { Shortcuts } from "../resources/shortcut/Shortcuts"
import { Page } from "./page/Page"

type Bar = {
    startTicks: number,
    endTicks: number,
    events: ChordEvent[]
}

export function PlaybackTabView(props: {
    playback: Playback,
    renderer: PlaybackTabRenderer
}) {
    useShortcut(Shortcuts.Play, onPlayPause)
    useShortcut(Shortcuts.Reset, onReset)

    const { playing } = useComponent(props.playback)
    const mixer = useResource(Mixer)

    props.playback.deltaTime
    const bars = useMemo(() => {
        const bars: Bar[] = []
        let bar: Bar = {
            startTicks: 0,
            endTicks: Tempo.BAR,
            events: []
        }

        for (const event of props.renderer.chordEvents) {
            if (event.ticks >= bar.endTicks) {
                bars.push(bar)
                bar = {
                    startTicks: Tempo.BAR * bars.length,
                    endTicks: Tempo.BAR * (bars.length + 1),
                    events: []
                }
            }
            bar.events.push(event)
        }

        bars.push(bar)
        return bars
    }, [props.renderer])

    function onPlayPause() {
        if (props.playback.playing) {
            props.playback.pause()
        } else {
            props.playback.play()
        }
    }

    function onReset() {
        props.playback.reset()
    }

    function onSeek(ticks: number) {
        props.playback.seekTicks(ticks)
    }

    return <Page className="PlaybackTabView">
        <Page.ConnectedTitle 
            title={props.playback.level.name}
        />

        <Page.Body containerClassName="PlaybackTabViewBody">
            <div className="flex gap-2 w-full gap-3">
                <Button
                    theme="primary"
                    onClick={onPlayPause}
                    className="w-26"
                >
                    <Icon name={playing ? "pause" : "play_arrow"} />
                    {playing ? "Pause" : "Play"}
                </Button>

                <Button
                    onClick={onReset}
                >
                    <Icon name="refresh" />
                    Reset
                </Button>


            </div>

            <FormInputField label="Audio Volume" className="w-full max-w-64">
                <MixerChannelView
                    className="w-full"
                    channel={mixer.audio}
                />
            </FormInputField>

            <div className="bars">
                {
                    bars.map(bar => <BarView
                        key={bar.startTicks}
                        bar={bar}
                        time={props.playback.time}
                        onSeek={onSeek}
                    />)
                }
            </div>
        </Page.Body>
    </Page>
}

function BarView(props: {
    bar: Bar,
    time: Time,
    onSeek: (ticks: number) => void
}) {
    function onPointerDown(event: PointerEvent<HTMLDivElement>) {
        const bounds = event.currentTarget.getBoundingClientRect()
        const ticks = (event.clientX - bounds.left) / bounds.width * (props.bar.endTicks - props.bar.startTicks) + props.bar.startTicks
        props.onSeek(Math.round(ticks))
    }

    return <div
        className="BarView"
        style={{
            "--bar-start-ticks": props.bar.startTicks,
            "--bar-duration": Tempo.BAR,
        } as CSSProperties}
        onPointerDown={onPointerDown}
    >
        {
            props.bar.events.map((event, index) => <ChordEventView
                event={event}
                key={index}
            />)
        }
        <Head
            minTicks={props.bar.startTicks}
            maxTicks={props.bar.endTicks}
            time={props.time}
        />
    </div>
}

function ChordEventView(props: { event: ChordEvent }) {
    return <div
        className="ChordEventView"
        style={{
            "--event-start-ticks": props.event.ticks,
            "--event-duration": props.event.duration,
        } as CSSProperties}
    >
        {props.event.chord.getLabel()}
    </div>
}

function Head(props: {
    minTicks: number,
    maxTicks: number,
    time: Time,
}) {
    const { ticks } = useComponent(props.time)

    if (ticks > props.maxTicks || ticks < props.minTicks) {
        return null
    }

    return <div className="Head" style={{
        "--head-ticks": ticks,
    } as CSSProperties} />
}