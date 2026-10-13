import type { Snapshotable } from "./Snapshotable";

export class History<T extends Snapshotable> {

    private _snapshots: Snapshotable.Snapshot<T>[] = []
    // private _index = -1


    save(instance: T) {
        this._snapshots.push(instance.snapshot())
    }

    undo(instance: T) {
        const snapshot = this._snapshots[this._snapshots.length - 1]

        if (snapshot) {
            instance.restore(snapshot)
            this._snapshots.length = this._snapshots.length - 1
        }
    }

    redo(_instance: T) {

    }

    get canUndo() {
        return this._snapshots.length > 0
    }

    get canRedo() {
        return this._snapshots.length > 0
    }

}