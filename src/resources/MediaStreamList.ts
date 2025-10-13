import { Resource } from "../engine/Resource";

export interface MediaStreamDescription {
    id: string,
    label: string
}

export class MediaStreamList extends Resource {

    private _streams: MediaStreamDescription[] = []

    get streams(): readonly MediaStreamDescription[] {
        return this._streams
    }

    async refresh() {
        const stram = await navigator.mediaDevices.getUserMedia({ audio: true })
        stram.getTracks().forEach(track => track.stop())

        const devices = await navigator.mediaDevices.enumerateDevices()
        this._streams = []
        for (const device of devices) {
            if (device.kind === "audioinput") {
                this._streams.push({
                    id: device.deviceId,
                    label: device.label,
                })
            }
        }

        this.changed()
    }

    request(id: string | null): Promise<MediaStream> {
        return navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: id ? { exact: id } : undefined,
                autoGainControl: false,
                noiseSuppression: false,
                echoCancellation: false
            }
        })
    }

}