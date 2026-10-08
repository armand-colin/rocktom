import { useEffect, useMemo, useRef, type CSSProperties, type PointerEvent } from "react"
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
import { Toggle } from "./toggle/Toggle"
import { PlaybackPreferences } from "../resources/PlaybackPreferences"

type CustomChordEvent = ChordEvent & {
    connectsEnd: boolean,
    connectsStart: boolean,
}

type Bar = {
    startTicks: number,
    endTicks: number,
    events: CustomChordEvent[],
}

const TAP_MOVE_THRESHOLD_PX = 10

export function PlaybackTabView(props: {
    playback: Playback,
    renderer: PlaybackTabRenderer
}) {
    useShortcut(Shortcuts.Play, onPlayPause)
    useShortcut(Shortcuts.Reset, onReset)

    const preferences = useResource(PlaybackPreferences)

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
            while (event.ticks >= bar.endTicks) {
                bars.push(bar)
                bar = {
                    startTicks: Tempo.BAR * bars.length,
                    endTicks: Tempo.BAR * (bars.length + 1),
                    events: []
                }
            }

            if (event.ticks + event.duration > bar.endTicks) {
                bar.events.push({
                    ...event,
                    duration: bar.endTicks - event.ticks,
                    connectsEnd: true,
                    connectsStart: false,
                })
                bars.push(bar)
                bar = {
                    startTicks: Tempo.BAR * bars.length,
                    endTicks: Tempo.BAR * (bars.length + 1),
                    events: []
                }
                bar.events.push({
                    ...event,
                    ticks: bar.startTicks,
                    duration: event.duration - (bar.startTicks - event.ticks),
                    connectsEnd: false,
                    connectsStart: true,
                })
            } else {
                bar.events.push({ ...event, connectsEnd: false, connectsStart: false })
            }
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

    function onScroll(element: HTMLElement) {
        if (!preferences.autoScroll) {
            return;
        }
        
        element.scrollIntoView({ behavior: "smooth" })
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

                <FormInputField label="Auto Scroll">
                    <Toggle value={preferences.autoScroll} onChange={() => preferences.autoScroll = !preferences.autoScroll}/>
                </FormInputField>
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
                        onScroll={onScroll}
                    />)
                }
            </div>
        </Page.Body>
    </Page>
}

function BarView(props: {
    bar: Bar,
    time: Time,
    onSeek: (ticks: number) => void,
    onScroll: (element: HTMLElement) => void
}) {
    const scrollAnchorRef = useRef<HTMLDivElement>(null)
    const gestureCleanupRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        return () => gestureCleanupRef.current?.()
    }, [])

    function onPointerDown(event: PointerEvent<HTMLDivElement>) {
        if (event.button !== 0) {
            return
        }

        const element = event.currentTarget
        const pointerId = event.pointerId
        const startX = event.clientX
        const startY = event.clientY
        const bounds = element.getBoundingClientRect()
        let slid = false

        function onPointerMove(moveEvent: globalThis.PointerEvent) {
            if (moveEvent.pointerId !== pointerId) {
                return
            }

            const dx = moveEvent.clientX - startX
            const dy = moveEvent.clientY - startY
            if (dx * dx + dy * dy > TAP_MOVE_THRESHOLD_PX * TAP_MOVE_THRESHOLD_PX) {
                slid = true
            }
        }

        function onPointerUp(upEvent: globalThis.PointerEvent) {
            if (upEvent.pointerId !== pointerId) {
                return
            }

            endGesture()
            if (slid || bounds.width === 0) {
                return
            }

            const ticks = (startX - bounds.left) / bounds.width * (props.bar.endTicks - props.bar.startTicks) + props.bar.startTicks
            props.onSeek(Math.round(ticks))
        }

        function onPointerCancel(cancelEvent: globalThis.PointerEvent) {
            if (cancelEvent.pointerId !== pointerId) {
                return
            }

            endGesture()
        }

        function endGesture() {
            window.removeEventListener("pointermove", onPointerMove)
            window.removeEventListener("pointerup", onPointerUp)
            window.removeEventListener("pointercancel", onPointerCancel)
            if (gestureCleanupRef.current === endGesture) {
                gestureCleanupRef.current = null
            }
        }

        gestureCleanupRef.current?.()
        gestureCleanupRef.current = endGesture
        window.addEventListener("pointermove", onPointerMove)
        window.addEventListener("pointerup", onPointerUp)
        window.addEventListener("pointercancel", onPointerCancel)
    }

    function onScroll() {
        if (scrollAnchorRef.current) {
            props.onScroll(scrollAnchorRef.current)
        }
    }

    return <div
        className="BarView"
        style={{
            "--bar-start-ticks": props.bar.startTicks,
            "--bar-duration": Tempo.BAR,
        } as CSSProperties}
        onPointerDown={onPointerDown}
    >
        <div className="scroll-anchor" ref={scrollAnchorRef}></div>
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
            onEnter={onScroll}
        />
    </div>
}

function ChordEventView(props: { event: CustomChordEvent }) {
    return <div
        className="ChordEventView"
        style={{
            "--event-start-ticks": props.event.ticks,
            "--event-duration": props.event.duration,
        } as CSSProperties}
        data-connects-end={props.event.connectsEnd}
        data-connects-start={props.event.connectsStart}
    >
        {props.event.chord.getLabel()}
    </div>
}

function Head(props: {
    minTicks: number,
    maxTicks: number,
    time: Time,
    onEnter: () => void,
}) {
    const { ticks } = useComponent(props.time)
    const scrolled = useRef<boolean>(false)

    useEffect(() => {
        if (ticks > props.minTicks && ticks < props.maxTicks) {
            if (scrolled.current) {
                return;
            }
            props.onEnter()
            scrolled.current = true
        } else {
            scrolled.current = false
        }
    }, [ticks, props.minTicks, props.maxTicks, props.onEnter])

    if (ticks > props.maxTicks || ticks < props.minTicks) {
        return null
    }

    return <div className="Head" style={{
        "--head-ticks": ticks,
    } as CSSProperties} />
}