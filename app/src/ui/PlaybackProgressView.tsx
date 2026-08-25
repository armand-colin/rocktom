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

    function onSectionClick(e: MouseEvent, start: number, sectionDuration: number) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const clickPosition = e.clientX - rect.left
        const clickRatio = sectionDuration > 0 ? clickPosition / rect.width : 0
        const newTicks = Math.max(
            0,
            Math.min(start + clickRatio * sectionDuration, duration)
        )
        props.playback.seekTicks(newTicks)
    }

    const sections = useMemo(() => {
        if (markersList.length === 0) {
            return [{ key: "full", start: 0, sectionDuration: duration, name: null }]
        }

        return markersList.map((marker, i) => {
            const start = marker.time
            const sectionDuration = i < markersList.length - 1
                ? markersList[i + 1].time - start
                : duration - start

            return {
                key: String(marker.time),
                start,
                sectionDuration,
                name: marker.name,
            }
        })
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
            style={{ "--ticks": ticks } as CSSProperties}
        >
            {sections.map(section => (
                <div
                    key={section.key}
                    className="section"
                    style={{
                        "--marker-time": section.start,
                        "--marker-duration": section.sectionDuration,
                    } as CSSProperties}
                    onClick={(e) => onSectionClick(e, section.start, section.sectionDuration)}
                >
                    <div className="bar" />
                    {section.name !== null && (
                        <span className="marker-label">{section.name}</span>
                    )}
                </div>
            ))}
        </div>
    </div>
}
