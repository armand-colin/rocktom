import { SoundNode } from "./SoundNode";

const DEFAULT_GAIN = 1.0

export class GainSoundNode extends SoundNode<GainNode> {

    private _gain: number = DEFAULT_GAIN

    constructor(audioContext: AudioContext) {
        super(audioContext)
        this.node = this.build()
    }

    get gain() {
        return this._gain
    }

    set gain(value: number) {
        this._gain = value
        this.node.gain.value = value
    }

    setGainSmooth(value: number, timeConstant = 0.01): void {
        this._gain = value
        const param = this.node.gain
        const now = this.audioContext.currentTime
        param.cancelAndHoldAtTime(now)
        param.setTargetAtTime(value, now, timeConstant)
    }

    protected build(): GainNode {
        const node = this.audioContext.createGain()
        // in case of first construction, this is undefined
        node.gain.value = this._gain ?? DEFAULT_GAIN
        return node
    }

    rebuild(): void {
        this.node = this.build()
    }

}