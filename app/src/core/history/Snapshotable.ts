export interface Snapshotable<T = any> {

    snapshot(): T
    restore(snapshot: T): void

}

export namespace Snapshotable {

    export type Snapshot<Instance extends Snapshotable> = ReturnType<Instance["snapshot"]>

}