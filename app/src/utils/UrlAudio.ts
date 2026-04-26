import { Duration } from "@niloc/utils";

function getDuration(url: string): Promise<Duration> {
    const audio = new Audio(url)

    return new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => {
            resolve(Duration.fromSeconds(audio.duration))
        })
        audio.addEventListener('error', (e) => {
            reject(e)
        })
    })
}

export const UrlAudio = {
    getDuration,
}