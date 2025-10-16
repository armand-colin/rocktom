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
    
    export type Tempo = {
        microsecondsPerBeat: number
    }
    
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Tempo {

        const MICROSECONDS_PER_MINUTE = 60000000

        export function bpm(bpm: number): Tempo {
            return {
                microsecondsPerBeat: MICROSECONDS_PER_MINUTE / bpm
            }
        }
    }

}