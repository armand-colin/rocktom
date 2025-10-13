import { Duration } from "@niloc/utils";
import { Time } from "../Time";
import { SoundNode } from "./SoundNode";

const FFT_SIZE = 16_384
const FREQUENCY_BIN_COUNT = FFT_SIZE / 2

export class SoundAnalyserNode extends SoundNode<AnalyserNode> {

    private _frequencies = new Float32Array(FREQUENCY_BIN_COUNT)

    protected build(): AnalyserNode {
        const analyser = this.audioContext.createAnalyser()
        analyser.fftSize = FFT_SIZE
        analyser.smoothingTimeConstant = Duration.seconds(Time.audioInterval)
        return analyser
    }

    compute() {
        this.node.getFloatFrequencyData(this._frequencies)
    }

    get frequencies() {
        return this._frequencies
    }

}