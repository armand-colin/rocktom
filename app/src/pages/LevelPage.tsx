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
import { Instrument } from "../sound/instrument/Instrument"
import { Tempo } from "../sound/Tempo"
import { TempoTrack } from "../sound/song/TempoTrack"
import { AudioTrack } from "../sound/song/AudioTrack"
import { FocusTrack } from "../sound/song/FocusTrack"
import { Focus } from "../sound/song/Focus"
import { LoadingScreen } from "../ui/loadingScreen/LoadingScreen"
import { useComponent } from "@niloc/ecs-react"

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

    if (error) {
        return <div>Error: {error.message}</div>
    }

    if (data && !data.ok) {
        return <p>Erreur</p>
    }

    return <LevelView
        level={data?.ok ? data.value : null}
        fetching={isLoading || !data}
    />
}

function LevelView(props: { level: LevelEntity | null, fetching: boolean }) {
    const [playback, setPlayback] = useState<Playback | null>(null)
    const [audioLoading, setAudioLoading] = useState(true)

    useEffect(() => {
        if (!props.level) {
            setPlayback(null)
            setAudioLoading(true)
            return
        }

        try {
            let level;
            if (props.level.serialized === "" || props.level.serialized === "{}") {
                level = new Level({
                    id: props.level.id,
                    name: props.level.name,
                    tracks: {
                        note: new NoteTrack(Instrument.BassStandard, [], []),
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
            setAudioLoading(playback.loading)
        } catch (error) {
            console.error(error)
            setPlayback(null)
            setAudioLoading(true)
        }
    }, [props.level])

    useEffect(() => {
        if (playback) {
            return () => {
                playback.destroy()
            }
        }
    }, [playback])

    const loading = props.fetching || !playback || audioLoading

    return (
        <LoadingScreen loading={loading}>
            {playback && (
                <>
                    <AudioLoadingSync
                        playback={playback}
                        onLoadingChange={setAudioLoading}
                    />
                    <PlaybackView playback={playback} />
                </>
            )}
        </LoadingScreen>
    )
}

function AudioLoadingSync(props: {
    playback: Playback
    onLoadingChange: (loading: boolean) => void
}) {
    const { loading } = useComponent(props.playback)

    useEffect(() => {
        props.onLoadingChange(loading)
    }, [loading, props.onLoadingChange])

    return null
}

