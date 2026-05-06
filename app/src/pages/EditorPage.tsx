import { useParams } from "react-router-dom"
import { useMutation } from "../hooks/useMutation"
import { LevelQueries } from "../queries/level/LevelQueries"
import { useEffect, useState } from "react"
import { LevelEditorView } from "../ui/levelEditor/LevelEditorView"
import type { LevelEntity } from "../queries/level/LevelEntity"
import { LevelEditor } from "../components/editor/LevelEditor"
import { Level } from "../sound/Level"
import { Instance } from "../Instance"
import { NoteTrack } from "../sound/song/NoteTrack"
import { Bass } from "../sound/instrument/Instrument"
import { Tempo } from "../sound/Tempo"
import { AudioTrack } from "../sound/song/AudioTrack"
import { AudioType } from "../sound/song/AudioTrack"
import { TempoTrack } from "../sound/song/TempoTrack"
import { FocusTrack } from "../sound/song/FocusTrack"
import { Focus } from "../sound/song/Focus"

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
            if (props.level.serialized === "" || props.level.serialized === "{}") {
                level = new Level({
                    id: props.level.id,
                    name: props.level.name,
                    tracks: {
                        note: new NoteTrack(new Bass(), [], []),
                        audio: new AudioTrack({ type: AudioType.None }, 0, 0),
                        tempo: new TempoTrack(new Tempo(120)),
                        focus: new FocusTrack(Focus.default(), [])
                    }
                })
            } else {
                const json = JSON.parse(props.level.serialized)
                const tracks = Level.deserializeTracks(json)

                level = new Level({
                    id: props.level.id,
                    name: props.level.name,
                    tracks: tracks
                })
            }
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