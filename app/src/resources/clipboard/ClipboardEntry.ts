import type { NoteEvent } from "../../sound/song/NoteEvent";
import { ClipboardEntryKind } from "./ClipboardEntryKind";

export type ClipboardEntry = {
    kind: ClipboardEntryKind.PatternNoteEvents,
    payload: NoteEvent[]
}

export namespace ClipboardEntry {

    export type OfKind<K extends ClipboardEntryKind> = Extract<ClipboardEntry, { kind: K }>

}
