import { Component } from "@niloc/ecs";

export abstract class Gesture extends Component {

    private _enabled: boolean = false

    get enabled() {
        return this._enabled
    }

    protected setEnabled(enabled: boolean) {
        this._enabled = enabled
    }

}