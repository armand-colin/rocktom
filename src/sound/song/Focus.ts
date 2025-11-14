import { Rules } from "../../3d/Rules"

export type Focus = {
    lowFret: number,
    highFret: number
}

export const Focus = {
    default(): Focus {
        return {
            lowFret: 0,
            highFret: Rules.maxFret
        }
    }
}