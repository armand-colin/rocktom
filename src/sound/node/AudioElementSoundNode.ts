import { SoundNode } from "./SoundNode";

export class AudioElementSoundNode extends SoundNode<MediaElementAudioSourceNode> {

    private _element: HTMLAudioElement

    constructor(audioContext: AudioContext, element: HTMLAudioElement) {
        super(audioContext)
        this._element = element
        this.node = this.build()
    }

    protected build(): MediaElementAudioSourceNode {
        return this.audioContext.createMediaElementSource(this._element)
    }

    rebuild(): void {
        this.node = this.build()
    }

}