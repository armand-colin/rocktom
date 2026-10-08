import { useNavigate } from "react-router-dom";
import type { LevelEntity } from "../../queries/level/LevelEntity";
import { Popup } from "../popup/Popup";
import { useMemo, useState } from "react";
import { useResource } from "@niloc/ecs-react";
import { GlobalPreferences } from "../../resources/GlobalPreferences";
import { Level } from "../../sound/Level";
import { Card } from "../button/Card";
import { Button, ButtonTheme } from "../button/Button";
import { PlaybackVisualMode } from "../../playback/PlaybackVisualMode";
import { FormInputField } from "../form/FormInputField";

export function LevelPopup(props: { level: LevelEntity, close: () => void }) {
    const navigate = useNavigate()
    const globalPreferences = useResource(GlobalPreferences)
    const [mode, setMode] = useState<PlaybackVisualMode>(globalPreferences.visualMode)

    const level = useMemo(() => {
        return props.level.serialized ?
            Level.deserialize({ name: props.level.name, id: props.level.id, serialized: props.level.serialized }) :
            null
    }, [props.level])

    function onPlayTrack(index: number) {
        navigate('/app/level/' + props.level.id + '/' + index + '?mode=' + mode)
        props.close()
    }

    return <Popup.BaseContainer size="md">
        <Popup.BaseTitle
            title={props.level.name}
            close={props.close}
        />
        <Popup.BaseContent gap={5}>
            <FormInputField label="Visual Mode" contentClassName="flex gap-2">
                <Button
                    theme={mode === PlaybackVisualMode.ThreeD ? ButtonTheme.Primary : ButtonTheme.Default}
                    onClick={() => setMode(PlaybackVisualMode.ThreeD)}
                    className="flex-1 max-w-30"
                >
                    3D
                </Button>
                <Button
                    theme={mode === PlaybackVisualMode.Tab ? ButtonTheme.Primary : ButtonTheme.Default}
                    onClick={() => setMode(PlaybackVisualMode.Tab)}
                    className="flex-1 max-w-30"
                >
                    Tab
                </Button>
            </FormInputField>
            {
                level && level.instrumentTracks.length > 0 ?
                    <FormInputField label="Select track to play" contentClassName="flex flex-col gap-2">
                        {
                            level.instrumentTracks.map((track, index) => {
                                return <Card containerClassName="p-4"
                                    key={track.id}
                                    onClick={() => onPlayTrack(index)}
                                >
                                    {track.instrument.name}
                                </Card>
                            })
                        }
                    </FormInputField> :
                    <p>No instrument track implemented yet</p>
            }
        </Popup.BaseContent>
    </Popup.BaseContainer>
}
