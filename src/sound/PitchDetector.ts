import type { SoundAnalyserNode } from "./node/SoundAnalyserNode";
import { Time } from "./Time";

export class PitchDetector {

    private _analyser: SoundAnalyserNode

    constructor(analyser: SoundAnalyserNode) {
        this._analyser = analyser

        setInterval(this._update, Time.audioInterval.milliseconds, undefined)
    }

    private _update = () => {
        this._analyser.compute()
        const frequencies = this._analyser.frequencies
        console.log(frequencies)
    }

}