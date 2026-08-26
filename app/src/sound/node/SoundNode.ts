export abstract class SoundNode<T extends (AudioNode | null) = AudioNode | null> {

    protected node!: T
    protected audioContext: AudioContext

    private _connections: SoundNode[] = []
    private _unregister: (() => void) | null = null

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext
    }

    protected abstract build(): T

    private _setUnregister(unregister: () => void) {
        this._unregister = unregister
    }

    static setUnregister(node: SoundNode, unregister: () => void) {
        node._setUnregister(unregister)
    }

    connect(node: SoundNode) {
        this._connections.push(node)

        if (this.node && node.node)
            this.node.connect(node.node)
    }

    disconnect(node?: SoundNode) {
        if (node === undefined) {
            this._connections = []
            if (this.node)
                this.node.disconnect()
        } else {
            const index = this._connections.indexOf(node)
            if (index !== -1) {
                this._connections.splice(index, 1)
                if (this.node && node.node)
                    this.node.disconnect(node.node)
            }
        }
    }

    dispose() {
        this.disconnect()
        this._unregister?.()
        this._unregister = null
    }

    protected connectToOutputs(source: AudioNode) {
        for (const node of this._connections) {
            if (node.node)
                source.connect(node.node)
        }
    }

    setAudioContext(audioContext: AudioContext) {
        this.audioContext = audioContext
    }

    refreshConnections() {
        if (!this.node)
            return

        for (const node of this._connections) {
            if (node.node)
                this.node.connect(node.node)
        }
    }

    abstract rebuild(): void

}