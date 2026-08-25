import { useComponent } from "@niloc/ecs-react";
import { useMemo, type CSSProperties, type MouseEvent } from "react";
import type { Playback } from "../components/Playback";
import { useShortcut } from "../hooks/useShortcut";
import { Shortcuts } from "../resources/shortcut/Shortcuts";
import { Button, ButtonTheme } from "./button/Button";
import { Icon } from "./icon/Icon";
import { ShortcutView } from "./shortcut/ShortcutView";
import { Tooltip } from "./tooltip/Tooltip";
import { UiSize } from "./UiSize";
import "./PlaybackProgressView.scss";

export function PlaybackProgressView(props: {
    playback: Playback
    minified?: boolean
}) {
    const { ticks } = useComponent(props.playback.time)
    const duration = props.playback.level.durationInTicks
    const markersList = props.playback.level.noteTrack.markers

    const nextMarker = useMemo(
        () => markersList.find(marker => marker.time > ticks),
        [markersList, ticks]
    )

    function onSkip() {
        const currentTicks = props.playback.time.ticks
        const next = props.playback.level.noteTrack.markers.find(
            marker => marker.time > currentTicks
        )
        if (!next)
            return
        props.playback.seekTicks(next.time)
    }

    useShortcut(Shortcuts.Skip, onSkip, { enabled: !!nextMarker })

    function onTrackClick(e: MouseEvent) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const clickPosition = e.clientX - rect.left
        const clickRatio = clickPosition / rect.width
        const newTicks = Math.max(0, Math.min(clickRatio * duration, duration))
        props.playback.seekTicks(newTicks)
    }

    const markers = useMemo(() => {
        const markersElements = []

        for (let i = 0; i < markersList.length; i++) {
            const marker = markersList[i]
            let markerDuration = 0
            if (i < markersList.length - 1) {
                const next = markersList[i + 1]
                markerDuration = next.time - marker.time
            } else {
                markerDuration = duration - marker.time
            }

            markersElements.push(
                <div
                    key={marker.time}
                    className="marker"
                    style={{
                        "--marker-duration": markerDuration,
                        "--marker-time": marker.time
                    } as CSSProperties}
                >
                    <span className="marker-label">{marker.name}</span>
                </div>
            )
        }

        return markersElements
    }, [markersList, duration])

    return <div
        className="PlaybackProgressView"
        data-minified={props.minified || undefined}
        data-can-skip={nextMarker ? true : undefined}
    >
        <div className="skip">
            <Tooltip
                size={UiSize.S}
                content={
                    <>
                        Skip
                        <ShortcutView shortcut={Shortcuts.Skip} />
                    </>
                }
            >
                <Button
                    onClick={onSkip}
                    size={UiSize.M}
                    shape="square"
                    theme={ButtonTheme.Primary}
                >
                    <Icon name="skip_next" />
                </Button>
            </Tooltip>
        </div>

        <div
            className="track"
            style={{
                '--progress': duration > 0 ? Math.min(ticks / duration, 1) : 0,
                '--duration': duration
            } as CSSProperties}
            onClick={onTrackClick}
        >
            <div className="bar"></div>
            {markers}
        </div>
    </div>
}
