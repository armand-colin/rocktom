import { Navigate, useParams, useSearchParams } from "react-router-dom"
import { LevelQueries } from "../queries/level/LevelQueries"
import { useEffect, useState } from "react"
import { Playback3DView } from "../ui/Playback3DView"
import type { LevelEntity } from "../queries/level/LevelEntity"
import { Playback } from "../components/Playback"
import { Level } from "../sound/Level"
import { Instance } from "../Instance"
import { LoadingScreen } from "../ui/loadingScreen/LoadingScreen"
import { useComponent, useResource } from "@niloc/ecs-react"
import { useQuery } from "../hooks/useQuery"
import { PlaybackVisualMode } from "../playback/PlaybackVisualMode"
import { Playback3DRenderer } from "../playback/Playback3DRenderer"
import { PlaybackTabRenderer } from "../playback/PlaybackTabRenderer"
import { PlaybackTabView } from "../ui/PlaybackTabView"
import { GlobalPreferences } from "../resources/GlobalPreferences"
import { Routes } from "../Routes"

export function LevelPage() {
    const { id, index } = useParams()
    const [searchParams] = useSearchParams()
    const globalPreferences = useResource(GlobalPreferences)
    const visualMode = PlaybackVisualMode.parseSafe(searchParams.get("mode")) ?? globalPreferences.visualMode

    if (!id) {
        return <Navigate to={Routes.Home.compile({})} />
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
                    {
                        playback.renderer instanceof Playback3DRenderer ?
                            <Playback3DView
                                playback={playback}
                                renderer={playback.renderer as Playback3DRenderer}
                            /> :
                            playback.renderer instanceof PlaybackTabRenderer ?
                                <PlaybackTabView
                                    playback={playback}
                                    renderer={playback.renderer as PlaybackTabRenderer}
                                /> :
                                null
                    }
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

