import { Engine } from "../engine/Engine";

function load(url: string): Promise<AudioBuffer> {
    return fetch(url)
        .then(response => response.arrayBuffer())
        .then(buffer => Engine.instance.sound.createAudioBuffer(buffer))
}

export const AudioBufferUtils = {
    load
}