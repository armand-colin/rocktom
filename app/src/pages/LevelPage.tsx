import { Navigate, useParams } from "react-router-dom"
import { LevelQueries } from "../queries/level/LevelQueries"
import { useEffect } from "react"
import { PlaybackView } from "../ui/PlaybackView"

export function LevelPage() {
    const { id } = useParams()
    const { data, isLoading, error, mutate: getLevel } = useMutation(LevelQueries.getById)

    useEffect(() => {
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
        return <Navigate to="/app" />
    }

    return <PlaybackView 
        
    />
}