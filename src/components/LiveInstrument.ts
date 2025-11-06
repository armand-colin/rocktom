import { Component, Engine } from "@niloc/ecs";
import { Workspace } from "../resources/Workspace";

export class LiveInstrument extends Component {

    private _name: string
    private _mediaStream: MediaStream
    private _streamId: string

    constructor(engine: Engine, stream: MediaStream, streamId: string, name: string) {
        super(engine)

        this._mediaStream = stream
        this._name = name
        this._streamId = streamId

        const workspace = engine.getResource(Workspace)
        workspace.setMicrophoneStream(this._mediaStream)
    }

    get name() {
        return this._name
    }

    get streamId() {
        return this._streamId
    }

    get stream() {
        return this._mediaStream
    }

    destroy() {
        // console.log('destroying', this._name, this._streamId)
        this._mediaStream.getTracks().forEach(track => track.stop())
        const workspace = this.engine.getResource(Workspace)
        // workspace.clearMicrophoneStream(this._mediaStream)
    }

}