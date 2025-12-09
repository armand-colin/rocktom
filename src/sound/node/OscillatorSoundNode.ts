import { SoundNode } from "./SoundNode";

export class OscillatorSoundNode extends SoundNode<OscillatorNode> {

    constructor(audioContext: AudioContext) {
        super(audioContext)
        this.node = this.build()
    }

    protected build(): OscillatorNode {
        const osc = this.audioContext.createOscillator()
        osc.start()
        return osc
    }

    rebuild(): void {
        this.node = this.build()
    }

    get frequency() {
        return this.node.frequency.value
    }

    set frequency(value: number) {
        this.node.frequency.setValueAtTime(value, this.audioContext.currentTime)
    }

}