import { nanoid } from "nanoid"
import { Tempo, type SerializedTempo } from "../Tempo"

export type TempoEvent = {
    id: string,
    ticks: number,
    time: number,
    tempo: Tempo
}

type SerializedTempoEvent = {
    id: string,
    ticks: number,
    time: number,
    tempo: SerializedTempo
}

export type SerializedTempoTrack = {
    initialTempo: SerializedTempo,
    events: SerializedTempoEvent[]
}

export class TempoTrack {

    initialTempo: Tempo
    events: TempoEvent[]

    constructor(initialTempo: Tempo, events?: TempoEvent[]) {
        this.initialTempo = initialTempo
        this.events = events ?? []
    }

    clone(): TempoTrack {
        return new TempoTrack(
            this.initialTempo,
            this.events.map(e => ({...e}))
        )
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
    * Refreshes all the events "tempo" based on their time and ticks
    */
    refreshTempo() {
        // First, sort all events by ticks, ascending
        this.events.sort((a, b) => a.ticks - b.ticks)

        let lastEvent: TempoEvent = {
            id: nanoid(),
            ticks: 0,
            time: 0,
            tempo: this.initialTempo
        }

        for (const event of this.events) {
            const deltaTicks = event.ticks - lastEvent.ticks
            const deltaSeconds = event.time - lastEvent.time
            lastEvent.tempo = Tempo.fromTicksPerSecond(deltaTicks / deltaSeconds)

            if (lastEvent.ticks === 0)
                this.initialTempo = lastEvent.tempo

            lastEvent = event
        }

        // TODO : proper handle
        // Copying for react
        this.events = [...this.events]
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

    insert(ticks: number): this {
        let lastEvent: TempoEvent = {
            id: nanoid(),
            ticks: 0,
            time: 0,
            tempo: this.initialTempo
        }

        for (let i = 0; i < this.events.length; i++) {
            const event = this.events[i]

            if (event.ticks > ticks) {
                // we must insert just before
                const tempo = lastEvent.tempo
                this.events.splice(i, 0, {
                    id: nanoid(),
                    tempo: tempo,
                    ticks: ticks,
                    time: this.secondsFromTicks(ticks)
                })
                return this
            }

            lastEvent = event
        }

        // Shall add at the end
        this.events.push({
            id: nanoid(),
            ticks,
            time: this.secondsFromTicks(ticks),
            tempo: lastEvent.tempo,
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

    serialize(): SerializedTempoTrack {
        return {
            events: this.events.map(event => ({
                id: event.id,
                ticks: event.ticks,
                time: event.time,
                tempo: event.tempo.serialize()
            })),
            initialTempo: this.initialTempo.serialize()
        }
    }

    static deserialize(data: SerializedTempoTrack): TempoTrack {
        const initialTempo = Tempo.deserialize(data.initialTempo)
        const events = data.events.map(eventData => ({
            id: eventData.id,
            ticks: eventData.ticks,
            time: eventData.time,
            tempo: Tempo.deserialize(eventData.tempo)
        }))
        const track = new TempoTrack(initialTempo, events)

        return track
    }

}