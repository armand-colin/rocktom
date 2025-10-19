// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Midi {

    export type TimeDivision = {
        type: 0,
        ticksPerBeat: number
    } | {
        type: 1,
        frameRate: number,
        ticksPerFrame: number
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace TimeDivision {

        export function ticksPerBeat(ticksPerBeat: number): TimeDivision {
            return {
                type: 0,
                ticksPerBeat
            }
        }

    }

    export type Tempo = {
        microsecondsPerBeat: number
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Tempo {

        const MICROSECONDS_PER_MINUTE = 60_000_000

        export function bpm(bpm: number): Tempo {
            return {
                microsecondsPerBeat: MICROSECONDS_PER_MINUTE / bpm
            }
        }

        export function toBPM(tempo: Tempo): number {
            return MICROSECONDS_PER_MINUTE / tempo.microsecondsPerBeat
        }
    }

    export interface Header {
        formatType: number,
        trackCount: number,
        timeDivision: Midi.TimeDivision
    }

}