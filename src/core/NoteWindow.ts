import { LinkedList } from "@niloc/utils"
import type { PlaybackNote } from "../components/PlaybackNote"
import type { Renderer } from "../resources/Renderer"

export class NoteWindow {

    private _current = LinkedList.create<{ i: number, note: PlaybackNote }>()

    constructor(
        readonly notes: PlaybackNote[],
        readonly renderer: Renderer
    ) { }

    iter() {
        return LinkedList.iter(this._current)
    }

    update(ticks: number, minTicks: number, maxTicks: number) {
        this._prune(minTicks, maxTicks)

        if (this._current.size === 0) {
            // Shall find first note to add
            for (let i = 0; i < this.notes.length; i++) {
                const note = this.notes[i]
                if (note.note.time + note.note.duration <= minTicks)
                    continue

                if (note.note.time + note.note.duration > maxTicks)
                    return

                LinkedList.push(this._current, { i, note })
                this.renderer.add(note.object)
                break
            }

            this._increaseForwards(maxTicks)
        } else {
            this._increaseForwards(maxTicks)
            this._increaseBackwards(minTicks)
        }

        for (const node of LinkedList.iter(this._current)) {
            node.note.update(ticks)
        }
    }

    clear() {
        for (const node of LinkedList.iter(this._current))
            this.renderer.remove(node.note.object)

        this._current = LinkedList.create()
    }

    private _prune(minTicks: number, maxTicks: number) {
        let node = this._current.head
        while (node) {
            const note = node.value.note
            if (note.note.time < minTicks || note.note.time + note.note.duration > maxTicks) {
                const nextNode = node.next
                LinkedList.remove(this._current, node)
                node = nextNode
                this.renderer.remove(note.object)
                continue
            }
            node = node.next
        }
    }

    private _increaseForwards(maxTicks: number) {
        if (!this._current.tail)
            return

        let index = this._current.tail.value.i + 1

        while (index < this.notes.length) {
            const note = this.notes[index]
            if (note.note.time > maxTicks)
                return

            LinkedList.push(this._current, { i: index, note })
            this.renderer.add(note.object)

            index++
        }
    }

    private _increaseBackwards(minTicks: number) {
        if (!this._current.head)
            return

        let index = this._current.head.value.i - 1

        while (index >= 0) {
            const note = this.notes[index]
            if (note.note.time + note.note.duration < minTicks)
                return

            LinkedList.unshift(this._current, { i: index, note })
            this.renderer.add(note.object)

            index--
        }
    }

}