import { SoundNode } from "./SoundNode";

export class AudioElementSoundNode extends SoundNode<MediaElementAudioSourceNode> {

    private _audio: HTMLAudioElement

    constructor(audioContext: AudioContext, audio: HTMLAudioElement) {
        super(audioContext)
        this._audio = audio
        this.node = this.build()
    }

    protected build(): MediaElementAudioSourceNode {
        return this.audioContext.createMediaElementSource(this._audio)
    }
    
    get audio() {
        return this.node.mediaElement
    }
    
    rebuild(): void {
        this.node = this.build()
    }
}