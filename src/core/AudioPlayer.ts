import type { Duration } from "@niloc/utils"

export interface AudioPlayer {

    getTime(): number
    schedulePlay(playAfter: Duration): void
    clearScheduledPlay(): void
    play(): void
    pause(): void
    seek(seconds: number): void
    setSpeed(speed: number): void
    setVolume(volume: number): void
    clear(): void

}