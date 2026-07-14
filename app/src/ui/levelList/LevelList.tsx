import { useResource } from "@niloc/ecs-react";
import { useRef, type ChangeEvent, type MouseEvent } from "react";
import { Button, ButtonTheme } from "../button/Button";
import { Icon } from "../icon/Icon";
import { UiSize } from "../UiSize";
import { ContextualMenu } from "../../resources/contextualMenu/ContextualMenu";
import type { LevelEntity } from "../../queries/level/LevelEntity";
import { Download } from "../../utils/download";
import { parseImportedLevelTracks, type ImportedLevelTracks } from "../../utils/levelImport";
import { useToastManager } from "../../hooks/useToastManager";
import { Toast } from "../toast/Toast";
import "./LevelList.scss";
import { ContextualMenuItem } from "../../resources/contextualMenu/ContextualMenuItem";

function formatSeconds(seconds: number) {
    const minutes = (seconds / 60) | 0
    const secs = (seconds % 60) | 0
    return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function sanitizeFilename(name: string) {
    return name.replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "") || "level"
}

function exportLevelTracks(level: LevelEntity) {
    const serialized = level.serialized === "" ? "{}" : level.serialized
    const content = JSON.stringify(JSON.parse(serialized), null, 2)
    Download.textFile(`${sanitizeFilename(level.name)}.json`, content)
}

function readFileAsText(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"))
        reader.readAsText(file)
    })
}

export function LevelList(props: {
    levels: LevelEntity[],
    onSelect: (level: LevelEntity) => void,
    onEdit: (level: LevelEntity) => void,
    onCreate: () => void,
    onImport: (level: LevelEntity, data: ImportedLevelTracks) => Promise<void>,
}) {
    const contextualMenu = useResource(ContextualMenu)
    const toastManager = useToastManager()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const pendingImportLevelRef = useRef<LevelEntity | null>(null)

    function startImport(level: LevelEntity) {
        pendingImportLevelRef.current = level
        fileInputRef.current?.click()
    }

    async function onFileSelected(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        e.target.value = ""

        const level = pendingImportLevelRef.current
        pendingImportLevelRef.current = null

        if (!file || !level) {
            return
        }

        try {
            const content = await readFileAsText(file)
            const imported = parseImportedLevelTracks(content)
            await props.onImport(level, imported)
            toastManager.add(close => <Toast.Simple
                message="Level imported successfully"
                close={close}
            />, 2000)
        } catch (error) {
            console.error(error)
            toastManager.add(close => <Toast.Simple
                message="Invalid level JSON file"
                close={close}
            />, 3000)
        }
    }

    function openLevelMenu(e: MouseEvent, level: LevelEntity) {
        contextualMenu.open(e.nativeEvent, [
            ContextualMenuItem.action({
                label: "Edit",
                icon: "edit",
                action: () => props.onEdit(level),
            }),
            ContextualMenuItem.action({
                label: "Export JSON",
                icon: "code",
                action: () => exportLevelTracks(level),
            }),
            ContextualMenuItem.action({
                label: "Import JSON",
                icon: "arrow_downward",
                action: () => startImport(level),
            }),
        ])
    }

    return <>
        <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={onFileSelected}
        />
        <ul className="LevelList">
        {
            props.levels.map((level) => (
                <li
                    key={level.id}
                    onContextMenu={e => openLevelMenu(e, level)}
                >
                    <div className="LevelList-info">
                        <p className="LevelList-name">{level.name}</p>
                        <small className="LevelList-duration">
                            <span className="LevelList-durationLabel">Duration</span>
                            {formatSeconds(level.duration)}
                        </small>
                    </div>

                    <div className="LevelList-actions">
                        <Button
                            size={UiSize.S}
                            onClick={(e) => openLevelMenu(e, level)}
                        >
                            <Icon name="more_vert" />
                        </Button>
                        <Button
                            className="LevelList-playButton"
                            size={UiSize.M}
                            shape="square"
                            theme={ButtonTheme.Primary}
                            onClick={() => props.onSelect(level)}
                        >
                            <Icon name="play_arrow" />
                        </Button>
                    </div>
                </li>
            ))
        }
    </ul>
    </>
}