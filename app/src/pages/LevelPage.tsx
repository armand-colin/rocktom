import { Navigate, useParams } from "react-router-dom"
import { LevelQueries } from "../queries/level/LevelQueries"
import { useEffect, useState } from "react"
import { useMutation } from "../hooks/useMutation"
import { PlaybackView } from "../ui/PlaybackView"
import type { LevelEntity } from "../queries/level/LevelEntity"
import { Playback } from "../components/Playback"
import { Level } from "../sound/Level"
import { Instance } from "../Instance"

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
        return <div>Loading...</div>
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

    return <LevelView 
        level={data.value}
    />
}

function LevelView(props: { level: LevelEntity }) {
    const [playback, setPlayback] = useState<Playback | null>(null)

    useEffect(() => {
        try {
            const json = JSON.parse(props.level.serialized)
            const deserialized = Level.deserializeTracks(json)
            const level = new Level({
                id: props.level.id,
                name: props.level.name,
                tracks: deserialized
            })
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