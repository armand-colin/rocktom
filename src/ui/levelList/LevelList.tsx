import { useResource } from "@niloc/ecs-react";
import { LevelStorage } from "../../resources/LevelStorage";
import { Level } from "../../sound/Level";
import { Button } from "../button/Button";
import { LiveInstrumentView } from "../liveInstrument/LiveInstrumentView";
import "./LevelList.scss";

function formatSeconds(seconds: number) {
    const minutes = (seconds / 60) | 0
    const secs = (seconds % 60) | 0
    return `${minutes}:${secs.toString().padStart(2, '0')}`
}
export function LevelList(props: {
    onSelect: (level: Level) => void,
    onEdit: (level: Level) => void,
    onClone: (level: Level) => void,
    onCreate: () => void
}) {
    const storage = useResource(LevelStorage)
    const { levels } = storage

    function onExport(level: Level) {
        const json = level.serialize()
        const blob = new Blob([JSON.stringify(json)], { type: "application/json" })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = `${level.name || "level"}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    function onImport() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json,application/json'
        input.onchange = () => {
            if (input.files && input.files.length > 0) {
                const file = input.files[0]
                const reader = new FileReader()
                reader.onload = () => {
                    try {
                        const json = JSON.parse(reader.result as string)
                        const level = Level.deserialize(json)
                        storage.save(level)
                    } catch (e) {
                        alert("Failed to import level: " + e)
                    }
                }

                reader.readAsText(file)
            }
        }
        input.click()
    }

    return <div className="LevelList">
        <h1>Rocktom</h1>
        <h2>List of available songs</h2>

        <Button onClick={props.onCreate}>Create</Button>
        <Button onClick={onImport}>Import</Button>
        <ul>
            {
                levels.map((level) => (
                    <li
                        key={level.id}
                        onClick={() => props.onSelect(level)}
                    >
                        <p>{level.name} by {level.author}</p>
                        <small>{formatSeconds(level.durationInSeconds | 0)}</small>

                        <Button onClick={(e) => {
                            e.stopPropagation()
                            props.onEdit(level)
                        }}>
                            Edit
                        </Button>
                        <Button onClick={e => {
                            e.stopPropagation()
                            props.onClone(level)
                        }}>
                            Clone
                        </Button>
                        <Button onClick={() => onExport(level)}>
                            Export
                        </Button>
                    </li>
                ))
            }
        </ul>

        <LiveInstrumentView />
    </div>
}