import { SoundNode } from "./SoundNode";

export class DestinationSoundNode extends SoundNode<AudioDestinationNode> {

    protected build(): AudioDestinationNode {
        return this.audioContext.destination
    }

}

