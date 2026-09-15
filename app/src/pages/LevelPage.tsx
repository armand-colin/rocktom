import { Navigate, useParams } from "react-router-dom"
import { LevelQueries } from "../queries/level/LevelQueries"
import { useEffect, useState } from "react"
import { PlaybackView } from "../ui/PlaybackView"
import type { LevelEntity } from "../queries/level/LevelEntity"
import { Playback } from "../components/Playback"
import { Level } from "../sound/Level"
import { Instance } from "../Instance"
import { LoadingScreen } from "../ui/loadingScreen/LoadingScreen"
import { useComponent } from "@niloc/ecs-react"
import { useQuery } from "../hooks/useQuery"

export function LevelPage() {
    const { id } = useParams()

    if (!id) {
        return <Navigate to="/app" />
    }

    const { result, isLoading } = useQuery(LevelQueries.getById, {
        arguments: {
            path: {
                id: id
            }
        }
    })

    return <LevelView
        fetching={isLoading || !result}
        level={result && result.ok ? result.value : null}
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
            const level = Level.deserialize({
                serialized: props.level.serialized,
                id: props.level.id,
                name: props.level.name,
            })

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

