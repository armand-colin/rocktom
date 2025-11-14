import { Focus } from "./Focus"

export type FocusEvent = {
    time: number,
    duration: number,
    focus: Focus
}

export class FocusTrack {

    readonly initialFocus: Focus
    readonly events: FocusEvent[]

    constructor(initialFocus: Focus, events: FocusEvent[]) {
        this.initialFocus = initialFocus
        this.events = events
    }

    getEventBetweenTicks(startTick: number, endTick: number): FocusEvent | null {
        if (this.events.length === 0)
            return null

        let m = 0
        let n = this.events.length - 1

        while (m <= n) {
            const k = (n + m) >> 1
            const event = this.events[k]
            if (event.time >= startTick && event.time < endTick)
                return event

            if (event.time < startTick) {
                m = k + 1
            } else {
                n = k - 1
            }
        }

        return null
    }

}

export class FocusTrackBuilder {

    private _events: FocusEvent[] = []
    private _initialFocus: Focus

    constructor(initialFocus?: [number, number]) {
        this._initialFocus = initialFocus ? {
            lowFret: initialFocus[0],
            highFret: initialFocus[1]
        } : Focus.default()
    }

    add(time: number, duration: number, frets: [number, number]): this {
        this._events.push({
            time,
            duration,
            focus: {
                lowFret: frets[0],
                highFret: frets[1]
            }
        })

        return this
    }

    build(): FocusTrack {
        return new FocusTrack(this._initialFocus, this._events)
    }

}