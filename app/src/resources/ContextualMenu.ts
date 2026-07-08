import { Resource } from "@niloc/ecs";
import { Vec2 } from "@niloc/utils";
import type { IconName } from "../ui/icon/Icon";

export type ContextualMenuItem = {
    icon: IconName | null,
    label: string,
    action: () => void,
}

export class ContextualMenu extends Resource {

    private _visible = false
    private _position: Vec2 = Vec2.create(0, 0)
    private _items: ContextualMenuItem[] = []

    get visible() {
        return this._visible
    }
    
    get position() {
        return this._position
    }
    
    get items() {
        return this._items
    }

    open(e: MouseEvent, items: ContextualMenuItem[]) {
        e.preventDefault()
        e.stopPropagation()
        
        this._position = Vec2.create(e.clientX, e.clientY)
        this._items = items
        this._visible = true
        this.changed()
    }

    close() {
        this._visible = false
        this.changed()
    }

}