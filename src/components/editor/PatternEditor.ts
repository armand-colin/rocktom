import { Component, Engine } from "@niloc/ecs";
import type { Pattern } from "../../sound/song/Pattern";
import { TimeTransform } from "./TimeTransform";

export class PatternEditor extends Component {

    readonly pattern: Pattern
    readonly transform: TimeTransform

    constructor(engine: Engine, pattern: Pattern) {
        super(engine)
        this.pattern = pattern
        this.transform = engine.createComponent(TimeTransform)
    }

}