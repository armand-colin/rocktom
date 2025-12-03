import { Engine, Resource } from "@niloc/ecs";
import { LevelEditor } from "../components/editor/LevelEditor";
import { Level } from "../sound/Level";

export class State extends Resource {

    private _editor: LevelEditor | null = null

    constructor(engine: Engine) {
        super(engine)
    }

    editLevel(level: Level) {
        const editor = this.engine.createComponent(LevelEditor, level)
        this._editor = editor
        this.changed()
    }

    get editor() {
        return this._editor
    }

}