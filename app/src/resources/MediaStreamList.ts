import { Resource } from "@niloc/ecs"
import { createElement } from "react"
import { LiveAudioConstraints } from "../sound/LiveAudioConstraints"
import { SoundEngine } from "./SoundEngine"
import { ToastManager } from "./ToastManager"
import { Toast } from "../ui/toast/Toast"

export interface MediaStreamDescription {
    deviceId: string,
    groupId: string,
    label: string
}

export class MediaStreamList extends Resource {

    private _streams: MediaStreamDescription[] = []
    private _loading = false
    private _error: string | null = null

    get streams(): readonly MediaStreamDescription[] {
        return this._streams
    }

    get loading(): boolean {
        return this._loading
    }

    get error(): string | null {
        return this._error
    }

    async refresh() {
        this._loading = true
        this._error = null

        try {
            await this._refresh()
        } catch (error) {
            this._streams = []
            this._error = this._formatError(error)
            this._notifyError(this._error)
        } finally {
            this._loading = false
            this.changed()
        }
    }

    private async _refresh() {
        const soundEngine = this.engine.getResource(SoundEngine)
        soundEngine.prepareForCapture()

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach(track => track.stop())

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
        } finally {
            soundEngine.restorePlaybackSession()
        }
    }

    request(id: string | null): Promise<MediaStream> {
        return LiveAudioConstraints.requestMediaStream(id)
    }

    private _formatError(error: unknown): string {
        if (error instanceof DOMException) {
            if (error.name === "NotAllowedError")
                return "Microphone permission denied"
            if (error.name === "NotFoundError")
                return "No microphone found"
            if (error.name === "InvalidStateError")
                return "Microphone unavailable (audio session conflict)"
            return error.message || error.name
        }

        if (error instanceof Error)
            return error.message

        return "Unable to access microphone"
    }

    private _notifyError(message: string) {
        this.engine.getResource(ToastManager).add(() =>
            createElement(Toast.Simple, { message, icon: "error" })
        )
    }

}
