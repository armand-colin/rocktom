export interface Tempo {
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