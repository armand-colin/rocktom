import { SoundNode } from "./SoundNode";

const DEFAULT_GAIN = 1.0

export class GainSoundNode extends SoundNode<GainNode> {

    private _gain: number = DEFAULT_GAIN

    get gain() {
        return this._gain
    }

    set gain(value: number) {
        this._gain = value
        this.node.gain.value = value
    }

    protected build(): GainNode {
        const node = this.audioContext.createGain()
        // in case of first construction, this is undefined
        node.gain.value = this._gain ?? DEFAULT_GAIN
        return node
    }

}