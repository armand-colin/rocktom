import { Component, Engine } from "@niloc/ecs";
import type { Coroutine } from "@niloc/utils";
import { Quaternion, Vector3, type Camera } from "three";
import { Rules } from "../3d/Rules";

export class CameraRig extends Component {

    private _camera: Camera
    private _focusCoroutine: Coroutine | null = null

    constructor(engine: Engine, camera: Camera) {
        super(engine)
        this._camera = camera
        Object.assign(window, { rig: this })
    }

    focus(minFret: number, maxFret: number) {
        const { position, rotation } = this._getFocusTransform(minFret, maxFret)
        this._camera.position.copy(position)
        this._camera.quaternion.copy(rotation)
    }


    private _getFocusTransform(minFret: number, maxFret: number): { rotation: Quaternion, position: Vector3 } {
        const centerX = (Rules.getX(minFret) + Rules.getX(maxFret)) / 2
        const distance = (maxFret - minFret) * 1

        const position = new Vector3()
        position.x = centerX
        position.y = distance * 0.1 + 2
        position.z = distance * 0.3 + 3

        const lookAt = new Vector3(centerX, 0, -100)
        lookAt.sub(position).normalize()

        const rotation = new Quaternion()
        rotation.setFromUnitVectors(new Vector3(0, 0, -1), lookAt)

        return { rotation, position }
    }

}