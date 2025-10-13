import { Duration } from "@niloc/utils";
import { Time } from "../Time";
import { SoundNode } from "./SoundNode";

const FFT_SIZE = 16_384

export class SoundAnalyserNode extends SoundNode<AnalyserNode> {

    private _frequencies = new Float32Array(0)

    protected build(): AnalyserNode {
        const analyser = this.audioContext.createAnalyser()
        analyser.fftSize = FFT_SIZE
        analyser.smoothingTimeConstant = Duration.seconds(Time.audioInterval)
        console.log(analyser.context.sampleRate, analyser.frequencyBinCount)
        return analyser
    }

    compute() {
        if (this._frequencies.length !== this.node.frequencyBinCount)
            this._frequencies = new Float32Array(this.node.frequencyBinCount)

        this.node.getFloatFrequencyData(this._frequencies)
    }

    get frequencies() {
        return this._frequencies
    }

    get sampleRate() {
        return this.node.context.sampleRate
    }

}