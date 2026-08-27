import type { HTMLAttributes, MouseEvent as ReactMouseEvent } from "react"
import type { PatternEditor as PatternEditorInstance } from "../components/editor/PatternEditor"
import type { Note } from "../sound/note/Note"
import type { NoteEvent as SoundNoteEvent } from "../sound/song/NoteEvent"
import { MouseTargetType } from "./MouseTargetType"

export const MouseTargetSymbol = Symbol("MouseTarget")

export namespace MouseTarget {
    export type NoteEvent = {
        type: MouseTargetType.NoteEvent
        editor: PatternEditorInstance
        noteEvent: SoundNoteEvent
    }

    export type NoteSlide = {
        type: MouseTargetType.NoteSlide
        editor: PatternEditorInstance
        noteEvent: SoundNoteEvent
    }

    export type NoteDurationStartResizer = {
        type: MouseTargetType.NoteDurationStartResizer
        editor: PatternEditorInstance
        noteEvent: SoundNoteEvent
    }

    export type NoteDurationEndResizer = {
        type: MouseTargetType.NoteDurationEndResizer
        editor: PatternEditorInstance
        noteEvent: SoundNoteEvent
    }

    export type NoteSlideDurationResizer = {
        type: MouseTargetType.NoteSlideDurationResizer
        editor: PatternEditorInstance
        noteEvent: SoundNoteEvent
    }

    export type PatternGrid = {
        type: MouseTargetType.PatternGrid
        editor: PatternEditorInstance
        container: HTMLElement
    }

    export type PatternEditor = {
        type: MouseTargetType.PatternEditor
        editor: PatternEditorInstance
    }

    export type PatternEditorKeyboard = {
        type: MouseTargetType.PatternEditorKeyboard
        editor: PatternEditorInstance
        note: Note
    }

    export function set(event: Event, target: MouseTarget) {
        const tagged = event as Event & { [MouseTargetSymbol]?: MouseTarget }
        if (tagged[MouseTargetSymbol])
            return

        tagged[MouseTargetSymbol] = target
    }

    export function get(event: Event): MouseTarget | null {
        return (event as Event & { [MouseTargetSymbol]?: MouseTarget })[MouseTargetSymbol] ?? null
    }

    export function props(target: MouseTarget): Pick<
        HTMLAttributes<HTMLElement>,
        "onMouseDown" | "onMouseUp" | "onClick" | "onContextMenu" | "onMouseOver" | "onMouseOut"
    > {
        const tag = (event: ReactMouseEvent) => MouseTarget.set(event.nativeEvent, target)
        return {
            onMouseDown: tag,
            onMouseUp: tag,
            onClick: tag,
            onContextMenu: tag,
            onMouseOver: tag,
            onMouseOut: tag,
        }
    }

    export function noteEvent(target: MouseTarget | null): SoundNoteEvent | null {
        if (!target)
            return null

        switch (target.type) {
            case MouseTargetType.NoteEvent:
            case MouseTargetType.NoteSlide:
            case MouseTargetType.NoteDurationStartResizer:
            case MouseTargetType.NoteDurationEndResizer:
            case MouseTargetType.NoteSlideDurationResizer:
                return target.noteEvent
            default:
                return null
        }
    }
}

export type MouseTarget =
    | MouseTarget.NoteEvent
    | MouseTarget.NoteSlide
    | MouseTarget.NoteDurationStartResizer
    | MouseTarget.NoteDurationEndResizer
    | MouseTarget.NoteSlideDurationResizer
    | MouseTarget.PatternGrid
    | MouseTarget.PatternEditor
    | MouseTarget.PatternEditorKeyboard
