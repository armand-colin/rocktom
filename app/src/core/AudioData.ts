import type { Engine } from "@niloc/ecs"
import { SoundEngine } from "../resources/SoundEngine"
import { nanoid } from "nanoid"
import { DocumentManager } from "../resources/DocumentManager"

export type AudioData = {
    id: string,
    duration: number,
    array: Float32Array,
    audioBuffer: AudioBuffer
}

function fetch(engine: Engine, documentId: string): Promise<AudioData> {
    return engine.getResource(DocumentManager).download(documentId)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to download audio data')
            }
            const buffer = response.value
            const cloned = new ArrayBuffer(buffer.byteLength);
            new Uint8Array(cloned).set(new Uint8Array(buffer));

            return cloned
        })
        .then(buffer => engine.getResource(SoundEngine).createAudioBuffer(buffer))
        .then(audioBuffer => {
            const array = audioBuffer.getChannelData(0)
            const duration = audioBuffer.duration

            return {
                id: nanoid(),
                duration,
                array,
                audioBuffer,
            }
        })
}

export const AudioData = {
    fetch
}