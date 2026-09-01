export namespace LiveAudioConstraints {

    export function createConstraints(deviceId: string | null): MediaTrackConstraints {
        return {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            autoGainControl: false,
            noiseSuppression: false,
            echoCancellation: false,
        }
    }

    export function requestMediaStream(deviceId: string | null): Promise<MediaStream> {
        return navigator.mediaDevices.getUserMedia({
            audio: createConstraints(deviceId),
        })
    }

}
