import { Component } from "@niloc/ecs";

export class Selection<T extends { id: string }> extends Component {

    private _elements: T[] = []

    get elements() {
        return this._elements
    }

    add(element: T) {
        if (this._elements.find(e => e.id === element.id))
            return

        this._elements.push(element)
        this.changed()
    }


    remove(element: T) {
        const index = this._elements.findIndex(e => e.id === element.id)
        if (index === -1)
            return

        this._elements.splice(index, 1)
        this.changed()
    }

    clear() {
        this._elements = []
        this.changed()
    }

}