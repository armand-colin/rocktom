import type { Engine } from "@niloc/ecs"
import { SoundEngine } from "../resources/SoundEngine"
import { nanoid } from "nanoid"
import { DocumentQueries } from "../queries/document/DocumentQueries"
import { DocumentManager } from "../resources/DocumentManager"

export type AudioData = {
    id: string,
    duration: number,
    array: Float32Array
}

function fetch(engine: Engine, documentId: string): Promise<AudioData> {
    return engine.getResource(DocumentManager).download(documentId)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to download audio data')
            }
            const buffer = response.value
            return buffer
        })
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