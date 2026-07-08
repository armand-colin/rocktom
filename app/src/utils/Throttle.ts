export class Throttle {

    private _timeout: number | null = null
    private _frequency: number

    constructor(frequency: number) {
        this._frequency = frequency
    }

    setFrequency(frequency: number) {
        this._frequency = frequency
    }

    call(fn: () => void) {
        if (this._timeout !== null) {
            return;
        }

        this._timeout = setTimeout(() => {
            this._timeout = null
            fn()
        }, this._frequency, undefined)
    }

    clear() {
        if (this._timeout !== null) {
            clearTimeout(this._timeout)
            this._timeout = null
        }
    }

}