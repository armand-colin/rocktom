import type { Duration } from "@niloc/utils"

export interface AudioPlayer {

    getTime(): number
    schedulePlay(playAfter: Duration): void
    play(): void
    pause(): void
    seek(seconds: number): void
    setSpeed(speed: number): void
    setVolume(volume: number): void
    clear(): void
    load(): Promise<void>
    isLoading(): boolean

}

function mock(timeFunction: () => number): AudioPlayer {
    return {
        getTime: timeFunction,
        schedulePlay: () => { },
        play: () => { },
        pause: () => { },
        seek: () => { },
        setSpeed: () => { },
        setVolume: () => { },
        clear: () => { },
        load: () => Promise.resolve(),
        isLoading: () => false,
    }
}

export const AudioPlayer = {
    mock
}