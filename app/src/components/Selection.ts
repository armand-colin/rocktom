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

    set(selection: T[]) {
        this._elements = selection;
        this.changed();
    }

    remove(element: T) {
        this.removeById(element.id)
    }

    removeById(elementId: string) {
        const index = this._elements.findIndex(e => e.id === elementId)
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