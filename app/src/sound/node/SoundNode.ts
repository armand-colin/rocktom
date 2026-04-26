export abstract class SoundNode<T extends (AudioNode | null) = AudioNode | null> {

    protected node!: T
    protected audioContext: AudioContext

    private _connections: SoundNode[] = []

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext
    }

    protected abstract build(): T

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