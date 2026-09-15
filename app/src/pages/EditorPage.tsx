import { Navigate, useParams } from "react-router-dom"
import { LevelQueries } from "../queries/level/LevelQueries"
import { useEffect, useState } from "react"
import { LevelEditorView } from "../ui/levelEditor/LevelEditorView"
import type { LevelEntity } from "../queries/level/LevelEntity"
import { LevelEditor } from "../components/editor/LevelEditor"
import { Level } from "../sound/Level"
import { Instance } from "../Instance"
import { useQuery } from "../hooks/useQuery"

export function EditorPage() {

    const { id } = useParams()

    if (!id) {
        return <Navigate to="/" />
    }

    const { result, isLoading } = useQuery(LevelQueries.getById, {
        arguments: {
            path: {
                id: id
            }
        }
    })

    if (isLoading || !result) {
        return <div>Loading...</div>
    }

    if (!result.ok) {
        return <div>Error: {result.error.message}</div>
    }

    return <EditorView level={result.value} />

}

function EditorView(props: { level: LevelEntity }) {
    const [editor, setEditor] = useState<LevelEditor | null>(null)

    useEffect(() => {
        let level;
        try {
            level = Level.deserialize({
                serialized: props.level.serialized,
                id: props.level.id,
                name: props.level.name,
            })
        } catch (error) {
            console.error(error)
            setEditor(null)
            return
        }
        setEditor(new LevelEditor(Instance.engine, level))
    }, [props.level])

    useEffect(() => {
        if (editor) {
            return () => {
                editor.destroy()
            }
        }
    }, [editor])

    if (!editor) {
        return <div>Loading...</div>
    }

    return <LevelEditorView
        editor={editor}
    />
}