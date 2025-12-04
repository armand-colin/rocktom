import { Component, Engine } from "@niloc/ecs";
import type { Pattern } from "../../sound/song/Pattern";

export class PatternEditor extends Component {

    readonly pattern: Pattern

    constructor(engine: Engine, pattern: Pattern) {
        super(engine)
        this.pattern = pattern
    }

}