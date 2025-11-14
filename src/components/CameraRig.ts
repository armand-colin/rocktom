import { Component, Engine } from "@niloc/ecs";
import type { Coroutine } from "@niloc/utils";
import { Animation, AnimationCurve, Duration } from "@niloc/utils";
import { Quaternion, Vector3, type Camera } from "three";
import { Rules } from "../3d/Rules";
import { Schedules } from "../Schedules";
import type { Focus } from "../sound/song/Focus";

type Transform = {
    position: Vector3,
    rotation: Quaternion
}

export class CameraRig extends Component {

    private _camera: Camera
    private _focusCoroutine: Coroutine | null = null

    constructor(engine: Engine, camera: Camera) {
        super(engine)
        this._camera = camera
        Object.assign(window, { rig: this })
    }

    focus(focus: Focus) {
        const { position, rotation } = this._getFocusTransform(focus)
        this._camera.position.copy(position)
        this._camera.quaternion.copy(rotation)

        if (this._focusCoroutine) {
            this._focusCoroutine.cancel()
            this._focusCoroutine = null
        }
    }

    transition(focus: Focus, duration: Duration) {
        if (this._focusCoroutine) {
            this._focusCoroutine.cancel()
            this._focusCoroutine = null
        }

        const endTransform = this._getFocusTransform(focus)
        this._focusCoroutine = this.startCoroutine(this._transitionCoroutine(endTransform, duration))
    }

    destroy() {
        if (this._focusCoroutine) {
            this._focusCoroutine.cancel()
            this._focusCoroutine = null
        }
    }

    private *_transitionCoroutine(transform: Transform, duration: Duration) {
        console.log("Transition coroutine started", duration)
        let time = Date.now()
        const startPosition = this._camera.position.clone()
        const startRotation = this._camera.quaternion.clone()

        const animation = new Animation(AnimationCurve.EaseInOut, duration, t => {
            this._camera.position.lerpVectors(startPosition, transform.position, t)
            this._camera.quaternion.slerpQuaternions(startRotation, transform.rotation, t)
        })

        while (true) {
            if (animation.finished)
                break

            animation.update(Duration.fromMilliseconds(Date.now() - time))
            time = Date.now()
            yield Schedules.Frame
        }
    }

    private _getFocusTransform(focus: Focus): Transform {
        const centerX = (Rules.getX(focus.lowFret) + Rules.getX(focus.highFret)) / 2
        const distance = (focus.highFret - focus.lowFret) * 1

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