import { EngineContext, useComponent } from "@niloc/ecs-react";
import { useContext } from "react";
import type { Playback } from "../components/Playback";
import { Renderer } from "../resources/Renderer";
import { ElementRenderer } from "./ElementRenderer";
import "./PlaybackView.scss";
// import { LiveInstrumentView } from "./liveInstrument/LiveInstrumentView";
import { Icon } from "./icon/Icon";
import { Tempo } from "../sound/Tempo";
import { PlaybackProgressView } from "./PlaybackProgressView";
import type { Time } from "../components/Time";
import { Mixer } from "../resources/Mixer";
import { useNavigate } from "react-router-dom";
import { InactiveHider, InactiveHiderFn, InactiveHiderState } from "./inactiveHider/InactiveHider";
import type { DeltaTime } from "../components/DeltaTime";
import { useShortcut } from "../hooks/useShortcut";
import { ShortcutView } from "./shortcut/ShortcutView";
import { Shortcuts } from "../resources/shortcut/Shortcuts";
import { FormInputField } from "./form/FormInputField";
import { MixerChannelView } from "./mixerView/MixerChannelView";
import { Tooltip } from "./tooltip/Tooltip";
import { UiSize } from "./UiSize";
import { Button, ButtonTheme } from "./button/Button";

export function PlaybackView(props: { playback: Playback }) {
    const { engine } = useContext(EngineContext)
    const renderer = engine.getResource(Renderer)

    const { playing } = useComponent(props.playback)

    useShortcut(Shortcuts.Play, onPlay)
    useShortcut(Shortcuts.Reset, onReset)

    function onPlay() {
        if (props.playback.playing)
            props.playback.pause()
        else
            props.playback.play()
    }

    function onReset() {
        props.playback.reset()
    }

    return <div className="PlaybackView">
        <div className="canvas">
            <ElementRenderer element={renderer.element} />
        </div>

        <PlaybackControls playback={props.playback} />

        <InactiveHiderFn enabled={playing} timeout={3000}>
            {({ state }) => (
                <PlaybackProgressView
                    playback={props.playback}
                    minified={state !== InactiveHiderState.Shown}
                />
            )}
        </InactiveHiderFn>
        {/* <LiveInstrumentView /> */}
    </div>
}

function PlaybackControls(props: { playback: Playback }) {
    const { engine } = useContext(EngineContext)
    const mixer = engine.getResource(Mixer)
    const navigate = useNavigate()

    const { playing } = useComponent(props.playback)

    return (
        <div className="PlaybackControls flex flex-col gap-3">
            <div>
                <button
                    className="BackButton"
                    onClick={() => navigate("/app")}
                >
                    <Icon name="arrow_back" /> Back to level selection
                </button>

                <h1>{props.playback.level.name}</h1>
            </div>

            <div className="buttons">
                <PlayButton playback={props.playback} />
                <ResetButton playback={props.playback} />
            </div>

            <InactiveHider
                enabled={playing}
                timeout={3000}
                className="flex flex-col gap-5"
            >
                <div className="flex flex-col gap-2">
                    <FormInputField label="Playback volume">
                        <MixerChannelView
                            channel={mixer.audio}
                            hideLabel
                        />
                    </FormInputField>
                    <FormInputField label="Metronome volume">
                        <MixerChannelView
                            channel={mixer.metronome}
                            hideLabel
                        />
                    </FormInputField>
                </div>

                <PlaybackTimeView
                    time={props.playback.time}
                    deltaTime={props.playback.deltaTime}
                />
            </InactiveHider>
        </div>
    );
}

function PlayButton(props: { playback: Playback }) {
    const { loading, playing } = useComponent(props.playback)
    const label = playing ? "Pause" : "Play"

    function onClick() {
        if (props.playback.playing)
            props.playback.pause()
        else
            props.playback.play()
    }

    return (
        <Tooltip
            size={UiSize.S}
            content={
                <>
                    {label}
                    <ShortcutView shortcut={Shortcuts.Play} />
                </>
            }
        >
            <Button
                className="PlayButton"
                onClick={onClick}
                disabled={loading}
                theme={ButtonTheme.Primary}
                size={UiSize.M}
                shape="square"
            >
                <Icon name={playing ? "pause" : "play_arrow"} />
            </Button>
        </Tooltip>
    )
}

function ResetButton(props: { playback: Playback }) {
    return (
        <Tooltip
            size={UiSize.S}
            content={
                <>
                    Reset
                    <ShortcutView shortcut={Shortcuts.Reset} />
                </>
            }
        >
            <button
                className="ResetButton"
                onClick={() => props.playback.reset()}
                aria-label="Reset"
            >
                <Icon name="refresh" />
            </button>
        </Tooltip>
    )
}

function formatPlaybackTime(seconds: number): string {
    const minutes = (seconds / 60) | 0
    const wholeSeconds = (seconds % 60) | 0
    const centiseconds = ((seconds * 100) % 100) | 0

    return `${minutes.toString().padStart(2, '0')}:${wholeSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
}

function PlaybackTimeView(props: { time: Time, deltaTime: DeltaTime }) {
    const time = useComponent(props.time)
    const { deltaTime } = useComponent(props.deltaTime)

    const bars = (time.ticks / Tempo.bars(1)) | 0
    const beatInBar = (time.ticks % Tempo.bars(1)) / Tempo.PPQ

    return <div className="PlaybackTimeView">
        <div className="field">
            <span className="label">Time</span>
            <span className="value">{formatPlaybackTime(time.seconds)}</span>
        </div>
        <div className="field">
            <span className="label">Ticks</span>
            <span className="value">{time.ticks}</span>
        </div>
        <div className="field">
            <span className="label">Tempo</span>
            <span className="value">{time.tempo.bpm.toFixed(1)} BPM</span>
        </div>
        <div className="field">
            <span className="label">Bar</span>
            <span className="value">{bars} : {beatInBar.toFixed(1)}</span>
        </div>
        <div className="field">
            <span className="label">Delta</span>
            <span className="value">{(deltaTime * 1000) | 0}ms</span>
        </div>
    </div>
}