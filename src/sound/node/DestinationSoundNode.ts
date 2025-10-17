import { SoundNode } from "./SoundNode";

export class DestinationSoundNode extends SoundNode<AudioDestinationNode> {

    constructor(audioContext: AudioContext) {
        super(audioContext)
        this.node = this.build()
    }

    protected build(): AudioDestinationNode {
        return this.audioContext.destination
    }

    rebuild(): void {
        this.node = this.build()
    }

}

