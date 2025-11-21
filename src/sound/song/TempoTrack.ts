import type { Tempo } from "../Tempo"

type TempoEvent = {
    ticks: number,
    time: number,
    tempo: Tempo
}

export class TempoTrack {

    private readonly _initialTempo: Tempo
    events: TempoEvent[]

    constructor(initialTempo: Tempo) {
        this._initialTempo = initialTempo
        this.events = []
    }

    add(ticks: number, tempo: Tempo): this {
        this.events.push({
            ticks,
            time: this.secondsFromTicks(ticks),
            tempo
        })

        return this
    }

    secondsFromTicks(ticks: number): number {
        let lastEvent: TempoEvent = {
            ticks: 0,
            time: 0,
            tempo: this._initialTempo
        }

        for (const event of this.events) {
            if (event.ticks < ticks)
                break

            lastEvent = event
        }

        const seconds = lastEvent.tempo.secondsFromTicks(ticks - lastEvent.ticks) + lastEvent.time
        return seconds
    }

    ticksFromSeconds(seconds: number): number {
        let lastEvent: TempoEvent = {
            ticks: 0,
            time: 0,
            tempo: this._initialTempo
        }

        for (const event of this.events) {
            if (event.time < seconds)
                break

            lastEvent = event
        }

        const deltaSeconds = seconds - lastEvent.time
        const deltaTicks = lastEvent.tempo.ticksFromSeconds(deltaSeconds)

        console.log("Elapsed", seconds, "bpm", lastEvent.tempo.bpm)

        return lastEvent.ticks + deltaTicks
    }

}