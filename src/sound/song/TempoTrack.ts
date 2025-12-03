import { nanoid } from "nanoid"
import { Tempo } from "../Tempo"

type TempoEvent = {
    id: string,
    ticks: number,
    time: number,
    tempo: Tempo
}

export class TempoTrack {

    initialTempo: Tempo
    events: TempoEvent[]

    constructor(initialTempo: Tempo) {
        this.initialTempo = initialTempo
        this.events = []
    }

    static fromKeyframes(keyframes: { seconds: number, ticks: number }[]) {
        if (keyframes.length < 1)
            throw new Error("At least one keyframe is required to build a TempoTrack")

        const initialTempo = Tempo.fromTicksPerSecond(
            keyframes[0].ticks / keyframes[0].seconds
        )

        const track = new TempoTrack(initialTempo)

        for (let i = 1; i < keyframes.length; i++) {
            const nextFrame = keyframes[i]
            const prevFrame = keyframes[i - 1]

            const tempo = Tempo.fromTicksPerSecond(
                (nextFrame.ticks - prevFrame.ticks) / (nextFrame.seconds - prevFrame.seconds)
            )

            track.add(prevFrame.ticks, tempo)
        }

        return track
    }

    /*
    * Refreshes all the events "time" based on their ticks and tempos
    */
    refreshTime() {
        // First, sort all events by ticks, ascending
        this.events.sort((a, b) => a.ticks - b.ticks)

        let lastEvent: TempoEvent = {
            id: nanoid(),
            ticks: 0,
            time: 0,
            tempo: this.initialTempo
        }

        for (const event of this.events) {
            const deltaSeconds = lastEvent.tempo.secondsFromTicks(event.ticks - lastEvent.ticks)
            event.time = lastEvent.time + deltaSeconds
            
            lastEvent = event
        }
    }

    add(ticks: number, tempo: Tempo): this {
        this.events.push({
            id: nanoid(),
            ticks,
            time: this.secondsFromTicks(ticks),
            tempo
        })

        return this
    }

    getTempoAt(ticks: number): Tempo {
        let lastEvent: TempoEvent = {
            id: nanoid(),
            ticks: 0,
            time: 0,
            tempo: this.initialTempo
        }

        for (const event of this.events) {
            if (event.ticks > ticks)
                break

            lastEvent = event
        }

        return lastEvent.tempo
    }

    secondsFromTicks(ticks: number, secondsOffset = 0): number {
        if (secondsOffset > 0) {
            const ticksOffset = this.ticksFromSeconds(secondsOffset)
            ticks += ticksOffset
        }

        let lastEvent: TempoEvent = {
            id: nanoid(),
            ticks: 0,
            time: 0,
            tempo: this.initialTempo
        }

        for (const event of this.events) {
            if (event.ticks > ticks)
                break

            lastEvent = event
        }

        const seconds = lastEvent.tempo.secondsFromTicks(ticks - lastEvent.ticks) + lastEvent.time
        return seconds - secondsOffset
    }

    ticksFromSeconds(seconds: number, tickOffset: number = 0): number {
        if (tickOffset > 0) {
            const secondsOffset = this.secondsFromTicks(tickOffset)
            seconds += secondsOffset
        }

        let lastEvent: TempoEvent = {
            id: nanoid(),
            ticks: 0,
            time: 0,
            tempo: this.initialTempo
        }

        for (const event of this.events) {
            if (event.time > seconds)
                break

            lastEvent = event
        }

        const deltaSeconds = seconds - lastEvent.time
        const deltaTicks = lastEvent.tempo.ticksFromSeconds(deltaSeconds)

        return lastEvent.ticks + deltaTicks - tickOffset
    }

}