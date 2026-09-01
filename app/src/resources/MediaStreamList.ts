import { Resource } from "@niloc/ecs"
import { LiveAudioConstraints } from "../sound/LiveAudioConstraints"

export interface MediaStreamDescription {
    deviceId: string,
    groupId: string,
    label: string
}

export class MediaStreamList extends Resource {

    private _streams: MediaStreamDescription[] = []
    private _loading = false

    get streams(): readonly MediaStreamDescription[] {
        return this._streams
    }

    get loading(): boolean {
        return this._loading
    }

    async refresh() {
        this._loading = true

        try {
            await this._refresh()
        } finally {
            this._loading = false
            this.changed()
        }
    }

    private async _refresh() {
        const stram = await navigator.mediaDevices.getUserMedia({ audio: true })
        stram.getTracks().forEach(track => track.stop())

        const devices = await navigator.mediaDevices.enumerateDevices()
        
        this._streams = []
        for (const device of devices) {
            if (device.kind === "audioinput") {
                this._streams.push({
                    deviceId: device.deviceId,
                    groupId: device.groupId,
                    label: device.label,
                })
            }
        }
    }

    request(id: string | null): Promise<MediaStream> {
        return LiveAudioConstraints.requestMediaStream(id)
    }

}