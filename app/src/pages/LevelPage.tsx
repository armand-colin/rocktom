import { Navigate, useParams, useSearchParams } from "react-router-dom"
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
import { PlaybackVisualMode } from "../playback/PlaybackVisualMode"

export function LevelPage() {
    const { id, index } = useParams()
    const [searchParams] = useSearchParams()

    if (!id) {
        return <Navigate to="/app" />
    }

    let parsedIndex: number | undefined = undefined

    if (index) {
        try {
            const parsed = parseInt(index)
            if (!isNaN(parsed)) {
                parsedIndex = parsed
            }
        } catch (_) { }
    }

    const visualMode = PlaybackVisualMode.fromSearchParam(searchParams.get("mode"))

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
        trackIndex={parsedIndex}
        visualMode={visualMode}
    />
}

function LevelView(props: {
    level: LevelEntity | null,
    fetching: boolean,
    trackIndex?: number,
    visualMode: PlaybackVisualMode,
}) {
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

            const playback = new Playback(
                Instance.engine,
                level,
                props.trackIndex ?? 0,
                props.visualMode,
            )
            setPlayback(playback)
            setAudioLoading(playback.loading)
        } catch (error) {
            console.error(error)
            setPlayback(null)
            setAudioLoading(true)
        }
    }, [props.level, props.visualMode])

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

