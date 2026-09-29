import { useNavigate } from "react-router-dom";
import type { LevelEntity } from "../../queries/level/LevelEntity";
import { Popup } from "../popup/Popup";
import { useMemo } from "react";
import { Level } from "../../sound/Level";
import { Card } from "../button/Card";

export function LevelPopup(props: { level: LevelEntity, close: () => void }) {
    const navigate = useNavigate()

    const level = useMemo(() => {
        return props.level.serialized ?
            Level.deserialize({ name: props.level.name, id: props.level.id, serialized: props.level.serialized }) :
            null
    }, [props.level])

    function onPlayTrack(index: number) {
        navigate('/app/level/' + props.level.id + '/' + index)
        props.close()
    }

    return <Popup.BaseContainer size="md">
        <Popup.BaseTitle
            title={props.level.name}
            close={props.close}
        />
        <Popup.BaseContent gap={4}>
            <p>Select track to play</p>
            {
                level && level.instrumentTracks.length > 0 ?
                    <ul className="flex flex-col gap-3">
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
                    </ul> :
                    <p>No instrument track implemented yet</p>
            }
        </Popup.BaseContent>
    </Popup.BaseContainer>
}