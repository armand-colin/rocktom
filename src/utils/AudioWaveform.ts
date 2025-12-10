import type { AudioData } from "../core/AudioData"
import type { TempoTrack } from "../sound/song/TempoTrack"

const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")!

export async function generate(opts: {
    audioData: AudioData,
    width: number,
    offset: number,
    ratio: number,
    audioStartSeconds: number,
    tempoTrack: TempoTrack
}) {
    const width = opts.width
    const height = 114

    canvas.width = width
    canvas.height = height

    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, width, height)

    const startTicks = -opts.offset
    const endTicks = -opts.offset + width / opts.ratio

    let startTime = Date.now()

    for (let i = 0; i < width; i += 1) {
        const ticks = (endTicks - startTicks) * (i / width) + startTicks
        const seconds = opts.tempoTrack.secondsFromTicks(ticks)
        const audioSeconds = seconds - opts.audioStartSeconds
        let y = height * 0.5
        
        if (audioSeconds >= 0 && audioSeconds <= opts.audioData.duration) {
            // We are in the range of the audio
            const audioT = audioSeconds / opts.audioData.duration
            const sampleIndex = Math.floor(audioT * opts.audioData.array.length)
            const sample = opts.audioData.array[sampleIndex]
            y = Math.floor((1 - (sample + 1) / 2) * height)
        }

        if (i === 0) {
            ctx.moveTo(i, y)
        } else {
            ctx.lineTo(i, y)
        }

        const now = Date.now()

        if (now - startTime > 10) {
            await new Promise(requestAnimationFrame)
            startTime = Date.now()
        }
    }

    ctx.strokeStyle = "white"
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.closePath()

    return canvas.toDataURL()
}

export const AudioWaveform = {
    generate
}