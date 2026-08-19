import { Resource } from "@niloc/ecs";
import { ClipboardEntryKind } from "./ClipboardEntryKind";
import type { ClipboardEntry } from "./ClipboardEntry";

export class Clipboard extends Resource {

    private _entry: ClipboardEntry | null = null

    get entry() {
        return this._entry
    }

    set(entry: ClipboardEntry) {
        this._entry = entry
        this.changed()
    }

    clear() {
        if (!this._entry)
            return

        this._entry = null
        this.changed()
    }

    has() {
        return this._entry !== null
    }

    hasKind<K extends ClipboardEntryKind>(kind: K) {
        return this._entry?.kind === kind
    }

    read<K extends ClipboardEntryKind>(kind: K): ClipboardEntry.OfKind<K> | null {
        if (this._entry?.kind !== kind)
            return null

        return this._entry as ClipboardEntry.OfKind<K>
    }

}
