import { SoundNode } from "./SoundNode";

export class OscillatorSoundNode extends SoundNode<OscillatorNode> {

    private _harmonics: readonly number[] | null = null

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
        this._applyHarmonics()
    }

    get frequency() {
        return this.node.frequency.value
    }

    set frequency(value: number) {
        this.node.frequency.setValueAtTime(value, this.audioContext.currentTime)
    }

    /**
     * Sets a custom PeriodicWave from harmonic amplitudes.
     * Index 0 = fundamental, index 1 = 2nd harmonic, etc.
     */
    setHarmonics(amplitudes: readonly number[]): void {
        this._harmonics = amplitudes
        this._applyHarmonics()
    }

    private _applyHarmonics(): void {
        if (!this._harmonics || this._harmonics.length === 0)
            return

        const n = this._harmonics.length
        const real = new Float32Array(n + 1)
        const imag = new Float32Array(n + 1)
        for (let i = 0; i < n; i++)
            imag[i + 1] = this._harmonics[i]

        const wave = this.audioContext.createPeriodicWave(real, imag)
        this.node.setPeriodicWave(wave)
    }

}
