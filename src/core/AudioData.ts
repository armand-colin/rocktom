import type { Engine } from "@niloc/ecs"
import { SoundEngine } from "../resources/SoundEngine"
import { nanoid } from "nanoid"

export type AudioData = {
    id: string,
    duration: number,
    array: Float32Array
}

function fetch(engine: Engine, url: string): Promise<AudioData> {
    return globalThis.fetch(url)
        .then(response => response.arrayBuffer())
        .then(buffer => engine.getResource(SoundEngine).createAudioBuffer(buffer))
        .then(audioBuffer => {
            const array = audioBuffer.getChannelData(0)
            const duration = audioBuffer.duration

            return {
                id: nanoid(),
                duration,
                array
            }
        })
}

export const AudioData = {
    fetch
}