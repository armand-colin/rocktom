import { Navigate, useParams } from "react-router-dom"
import { LevelQueries } from "../queries/level/LevelQueries"
import { useEffect, useState } from "react"
import { useMutation } from "../hooks/useMutation"
import { PlaybackView } from "../ui/PlaybackView"
import type { LevelEntity } from "../queries/level/LevelEntity"
import { Playback } from "../components/Playback"
import { Level } from "../sound/Level"
import { Instance } from "../Instance"
import { NoteTrack } from "../sound/song/NoteTrack"
import { Bass } from "../sound/instrument/Instrument"
import { Tempo } from "../sound/Tempo"
import { TempoTrack } from "../sound/song/TempoTrack"
import { AudioTrack } from "../sound/song/AudioTrack"
import { FocusTrack } from "../sound/song/FocusTrack"
import { Focus } from "../sound/song/Focus"
import { LoadingScreen } from "../ui/loadingScreen/LoadingScreen"

export function LevelPage() {
    const { id } = useParams()

    const { data, isLoading, error, mutate: getLevel } = useMutation(LevelQueries.getById)

    useEffect(() => {
        if (!id) {
            return
        }

        getLevel(id)
    }, [id])

    if (!id) {
        return <Navigate to="/app" />
    }

    if (isLoading) {
        return null;
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

    if (!data) {
        return <p>Pas de niveau trouvé</p>
    }

    if (!data.ok) {
        return <p>Erreur</p>
    }


    return <LoadingScreen>
        {
            !id ?
                null :
                isLoading ?
                    null :
                    error ?
                        <p>Error: {(error as Error).message}</p> :
                        !data ?
                            <p>Pas de niveau trouvé</p> :
                            !data.ok ?
                                <p>Erreur</p> :
                                <LevelView
                                    level={data.value}
                                />
        }
    </LoadingScreen>
}

function LevelView(props: { level: LevelEntity }) {
    const [playback, setPlayback] = useState<Playback | null>(null)

    useEffect(() => {
        try {
            let level;
            if (props.level.serialized === "" || props.level.serialized === "{}") {
                level = new Level({
                    id: props.level.id,
                    name: props.level.name,
                    tracks: {
                        note: new NoteTrack(new Bass(), [], []),
                        audio: new AudioTrack({ time: 0, playbackId: null }),
                        tempo: new TempoTrack(new Tempo(120)),
                        focus: new FocusTrack(Focus.default(), [])
                    }
                })
            } else {
                const json = JSON.parse(props.level.serialized)
                const deserialized = Level.deserializeTracks(json)
                level = new Level({
                    id: props.level.id,
                    name: props.level.name,
                    tracks: deserialized
                })
            }

            const playback = new Playback(Instance.engine, level)
            setPlayback(playback)
        } catch (error) {
            console.error(error)
            setPlayback(null)
        }
    }, [props.level])

    useEffect(() => {
        if (playback) {
            return () => {
                playback.destroy()
            }
        }
    }, [playback])

    if (!playback) {
        return <div>Loading...</div>
    }

    return <PlaybackView
        playback={playback}
    />
}