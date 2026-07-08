import { Component } from "@niloc/ecs";

export class DeltaTime extends Component {

    private _deltaTime: number = 0

    setDeltaTime(deltaTime: number) {
        this._deltaTime = deltaTime
        this.changed()
    }

    get deltaTime() {
        return this._deltaTime
    }

}