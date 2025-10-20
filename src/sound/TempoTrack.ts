import type { Tempo } from "./Tempo"

type TempoEvent = {
    time: number,
    tempo: Tempo
}

export class TempoTrack {

    events: TempoEvent[]

    constructor() {
        this.events = []
    }

    add(time: number, tempo: Tempo): this {
        this.events.push({
            time,
            tempo
        })

        return this
    }

}