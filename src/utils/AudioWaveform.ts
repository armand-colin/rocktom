export async function generate(audioUrl: string) {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    const width = 16_000
    const height = 32

    const audioData = await fetch(audioUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => new Promise<Float32Array>(resolve => {
            const audioContext = new AudioContext()
            audioContext.decodeAudioData(arrayBuffer, audioBuffer => {
                const rawData = audioBuffer.getChannelData(0) // Use the first channel
                resolve(rawData)
            })
        }))

    console.log(audioData)

    canvas.width = width
    canvas.height = height

    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, width, height)

    ctx.moveTo(0, height / 2)
    ctx.beginPath()
    for (let i = 0; i < width; i += 1) {
        const sample = audioData[Math.floor(i * audioData.length / width)]
        const x = i
        const y = Math.floor((1 - (sample + 1) / 2) * height)
        ctx.lineTo(x, y)
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