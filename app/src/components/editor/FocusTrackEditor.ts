import { Component, Engine } from "@niloc/ecs";
import type { FocusEvent, FocusTrack } from "../../sound/song/FocusTrack";
import { Focus } from "../../sound/song/Focus";
import { nanoid } from "nanoid";
import { Tempo } from "../../sound/Tempo";

export class FocusTrackEditor extends Component {

    readonly track: FocusTrack

    constructor(engine: Engine, track: FocusTrack) {
        super(engine)
        this.track = track
    }

    setInitialFocus(focus: Focus) {
        this.track.initialFocus = focus
        this.changed()
    }

    addFocusEvent(ticks: number) {
        const duration = Tempo.bars(1)
        const time = Math.max(0, ticks - duration)
        
        const event: FocusEvent = {
            id: nanoid(),
            time: time,
            duration: duration,
            focus: Focus.default()
        }

        this.track.events.push(event)
        this.track.events.sort((a, b) => a.time - b.time)
        this.changed()
    }

    setFocus(id: string, focus: Focus) {
        const event = this.track.events.find(e => e.id === id)
        if (!event)
            return

        event.focus = focus
        this.changed()
    }

    remove(id: string) {
        const index = this.track.events.findIndex(e => e.id === id)
        if (index === -1)
            return

        this.track.events.splice(index, 1)
        this.changed()
    }

    setTime(id: string, ticks: number) {
        const event = this.track.events.find(e => e.id === id)
        if (!event)
            return

        event.time = ticks
        this.track.events.sort((a, b) => a.time - b.time)
        this.changed()
    }

    setDuration(id: string, duration: number) {
        const event = this.track.events.find(e => e.id === id)
        if (!event)
            return
        
        event.duration = duration
        this.changed()
    }

    setStartTime(id: string, ticks: number) {
        const event = this.track.events.find(e => e.id === id)
        if (!event)
            return

        const endTime = event.time + event.duration
        event.time = ticks
        event.duration = Math.max(0, endTime - ticks)
        this.track.events.sort((a, b) => a.time - b.time)
        this.changed()
    }
}