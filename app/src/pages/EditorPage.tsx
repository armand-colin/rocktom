import { useParams } from "react-router-dom"
import { useMutation } from "../hooks/useMutation"
import { LevelQueries } from "../queries/level/LevelQueries"
import { useEffect, useState } from "react"
import { LevelEditorView } from "../ui/levelEditor/LevelEditorView"
import type { LevelEntity } from "../queries/level/LevelEntity"
import { LevelEditor } from "../components/editor/LevelEditor"
import { Level } from "../sound/Level"
import { Instance } from "../Instance"

export function EditorPage() {

    const { id } = useParams()
    const { data, isLoading, error, mutate: getLevel } = useMutation(LevelQueries.getById)
    useEffect(() => {
        if (!id) {
            return
        }

        getLevel(id)
    }, [id])

    if (isLoading || !data) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

    if (!data.ok) {
        return <div>Loading...</div>
    }

    return <EditorView level={data.value} />

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