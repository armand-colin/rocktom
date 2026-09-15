export type AdsrParams = {
    attack: number
    decay: number
    sustain: number
    release: number
}

type Phase = "idle" | "attack" | "decay" | "sustain" | "release"

export class Adsr {

    private readonly _attack: number
    private readonly _decay: number
    private readonly _sustain: number
    private readonly _release: number

    private _phase: Phase = "idle"
    private _time = 0
    private _noteOnTime = 0
    private _releaseStartTime = 0
    private _releaseStartLevel = 0
    private _value = 0
    private _releaseRequested = false
    private _finished = true

    constructor(params: AdsrParams) {
        this._attack = Math.max(0, params.attack)
        this._decay = Math.max(0, params.decay)
        this._sustain = Math.min(1, Math.max(0, params.sustain))
        this._release = Math.max(0, params.release)
    }

    noteOn(time: number): void {
        this._noteOnTime = time
        this._time = time
        this._releaseRequested = false
        this._finished = false
        this._phase = this._attack > 0 ? "attack" : "decay"
        this._value = this._attack > 0 ? 0 : 1
        if (this._phase === "decay" && this._decay <= 0) {
            this._phase = "sustain"
            this._value = this._sustain
        }
        this._reevaluate()
    }

    noteOff(time: number): void {
        if (this._finished || this._phase === "idle")
            return

        this._releaseRequested = true
        this._time = Math.max(this._time, time)
        this._reevaluate()
    }

    setTime(time: number): void {
        this._time = time
        this._reevaluate()
    }

    get value(): number {
        return this._value
    }

    get finished(): boolean {
        return this._finished
    }

    private _reevaluate(): void {
        if (this._finished || this._phase === "idle") {
            this._value = 0
            this._finished = true
            return
        }

        const t = this._time
        const attackEnd = this._noteOnTime + this._attack

        // Attack always runs to completion, even after noteOff.
        if (this._phase !== "release" && t < attackEnd) {
            this._phase = "attack"
            this._value = this._attack > 0
                ? Math.min(1, Math.max(0, (t - this._noteOnTime) / this._attack))
                : 1
            return
        }

        if (this._phase === "attack") {
            if (this._releaseRequested) {
                this._enterRelease(attackEnd, 1)
                this._evaluateRelease(t)
                return
            }
            this._phase = "decay"
        }

        if (this._phase === "decay") {
            if (this._releaseRequested) {
                const level = this._levelAtDecay(t, attackEnd)
                this._enterRelease(t, level)
                this._evaluateRelease(t)
                return
            }

            const decayEnd = attackEnd + this._decay
            if (t < decayEnd) {
                this._value = this._levelAtDecay(t, attackEnd)
                return
            }

            this._phase = "sustain"
            this._value = this._sustain
        }

        if (this._phase === "sustain") {
            if (this._releaseRequested) {
                this._enterRelease(t, this._sustain)
                this._evaluateRelease(t)
                return
            }
            this._value = this._sustain
            return
        }

        if (this._phase === "release")
            this._evaluateRelease(t)
    }

    private _levelAtDecay(t: number, attackEnd: number): number {
        if (this._decay <= 0)
            return this._sustain
        const progress = Math.min(1, Math.max(0, (t - attackEnd) / this._decay))
        return 1 - (1 - this._sustain) * progress
    }

    private _enterRelease(time: number, level: number): void {
        this._phase = "release"
        this._releaseStartTime = time
        this._releaseStartLevel = level
        this._value = level
    }

    private _evaluateRelease(t: number): void {
        if (this._release <= 0) {
            this._value = 0
            this._phase = "idle"
            this._finished = true
            return
        }

        const progress = (t - this._releaseStartTime) / this._release
        if (progress >= 1) {
            this._value = 0
            this._phase = "idle"
            this._finished = true
            return
        }

        this._value = this._releaseStartLevel * (1 - Math.max(0, progress))
    }

}
