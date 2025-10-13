export abstract class SoundNode<T extends (AudioNode | null) = AudioNode | null> {

    protected audioContext: AudioContext
    protected node: T

    private _connections: SoundNode[] = []

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext
        this.node = this.build()
    }

    protected abstract build(): T

    connect(node: SoundNode) {
        console.log("Connecting", this, node)

        this._connections.push(node)

        if (this.node && node.node)
            this.node.connect(node.node)
    }

    refreshConnections() {
        console.log("Refreshing connections", this)
        if (!this.node)
            return

        for (const node of this._connections) {
            if (node.node)
                this.node.connect(node.node)
        }
    }

}