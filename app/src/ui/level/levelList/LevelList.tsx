import { useResource } from "@niloc/ecs-react";
import { useMemo, useRef, type ChangeEvent, type MouseEvent } from "react";
import { ContextualMenu } from "../../../resources/contextualMenu/ContextualMenu";
import { LevelEntity } from "../../../queries/level/LevelEntity";
// import { Download } from "../../../utils/download";
import { parseImportedLevelTracks, type ImportedLevelTracks } from "../../../utils/levelImport";
import { useToastManager } from "../../../hooks/useToastManager";
import { Toast } from "../../toast/Toast";
import "./LevelList.scss";
import { ContextualMenuItem } from "../../../resources/contextualMenu/ContextualMenuItem";
import { LevelListItem } from "./LevelListItem";

// function sanitizeFilename(name: string) {
//     return name.replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "") || "level"
// }

// function exportLevelTracks(level: LevelEntity) {
//     const serialized = level.serialized === "" ? "{}" : level.serialized
//     const content = JSON.stringify(JSON.parse(serialized), null, 2)
//     Download.textFile(`${sanitizeFilename(level.name)}.json`, content)
// }

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
    onRemove: (level: LevelEntity) => void,
    onImport: (level: LevelEntity, data: ImportedLevelTracks) => Promise<void>,
    onShare: (level: LevelEntity) => void,
    userId: string | null,
}) {
    const contextualMenu = useResource(ContextualMenu)
    const toastManager = useToastManager()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const pendingImportLevelRef = useRef<LevelEntity | null>(null)

    // function startImport(level: LevelEntity) {
    //     pendingImportLevelRef.current = level
    //     fileInputRef.current?.click()
    // }

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
        const items: ContextualMenuItem[] = []
        console.log("poping", props.userId, level.userId)
        if (
            level.userId === props.userId ||
            (
                level.share &&
                level.share.permission === LevelEntity.SharePermission.Write &&
                level.share.enabled
            )
        ) {
            items.push(ContextualMenuItem.action({
                label: "Edit",
                icon: "edit",
                action: () => props.onEdit(level),
            }))
        }

        if (level.userId === props.userId) {
            items.push(ContextualMenuItem.action({
                label: level.share ? "Edit sharing" : "Share",
                icon: "share",
                action: () => props.onShare(level),
            }))

            items.push(ContextualMenuItem.action({
                label: "Delete",
                icon: "delete",
                theme: 'danger',
                action: () => props.onRemove(level),
            }))
        }

        contextualMenu.open(e.nativeEvent, items)
    }

    const { owned, shared } = useMemo(() => {
        const owned = []
        const shared = []

        for (const level of props.levels) {
            if (level.userId === props.userId) {
                owned.push(level)
            } else {
                shared.push(level)
            }
        }

        return { owned, shared }
    }, [props.levels])

    return <div className="LevelList">
        <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={onFileSelected}
        />
        {
            owned.length > 0 && <div className="CategorizedLevelList">
                <h2>Owned</h2>
                <ul>
                    {
                        owned.map((level) => (
                            <LevelListItem
                                key={level.id}
                                level={level}
                                onSelect={props.onSelect}
                                onMenuOpen={openLevelMenu}
                                hideMenu={level.userId !== props.userId}
                            />
                        ))
                    }
                </ul>
            </div>
        }

        {
            shared.length > 0 && <div className="CategorizedLevelList">
                <h2>Shared</h2>
                <ul>
                    {
                        shared.map((level) => (
                            <LevelListItem
                                key={level.id}
                                level={level}
                                onSelect={props.onSelect}
                                onMenuOpen={openLevelMenu}
                                hideMenu={level.userId !== props.userId}
                            />
                        ))
                    }
                </ul>
            </div>
        }
    </div>
}