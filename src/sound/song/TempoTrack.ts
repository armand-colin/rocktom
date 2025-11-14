import type { Tempo } from "../Tempo"

type TempoEvent = {
    time: number,
    tempo: Tempo
}

export class TempoTrack {

    readonly initialTempo: Tempo
    events: TempoEvent[]

    constructor(initialTempo: Tempo) {
        this.initialTempo = initialTempo
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