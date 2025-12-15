import { Component, Engine } from "@niloc/ecs";
import type { TempoTrack } from "../../sound/song/TempoTrack";
import { Tempo } from "../../sound/Tempo";

export class TempoTrackEditor extends Component {

    readonly track: TempoTrack

    constructor(engine: Engine, tempoTrack: TempoTrack) {
        super(engine)
        this.track = tempoTrack
    }

    setInitial(bpm: number) {
        this.track.initialTempo = new Tempo(bpm)
        this.track.refreshTime()
        this.changed()
    }

    addEvent(ticks: number) {
        this.track.insert(ticks)
        this.changed()
    }

    setEventTime(id: string, time: number) {
        if (time < 0)
            // This shall not happen
            return


        for (let i = 0; i < this.track.events.length; i++) {
            const event = this.track.events[i]

            if (event.id !== id)
                continue

            // Check for previous and next envent, to get sure that time is in between events
            const prevEvent = i > 0 ? this.track.events[i - 1] : null
            const nextEvent = i < this.track.events.length - 1 ? this.track.events[i + 1] : null

            if (prevEvent && time < prevEvent.time)
                return

            if (nextEvent && time > nextEvent.time)
                return

            event.time = time
            this.track.refreshTempo()
            this.changed()
            return
        }
    }

    removeEvent(id: string) {
        const index = this.track.events.findIndex(event => event.id === id)
        if (index === -1)
            return

        this.track.events.splice(index, 1)
        this.track.refreshTempo()
        this.changed()
    }

}