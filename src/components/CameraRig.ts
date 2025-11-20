import { Component, Engine } from "@niloc/ecs";
import type { Coroutine } from "@niloc/utils";
import { Animation, AnimationCurve, Duration } from "@niloc/utils";
import { Euler, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { Rules } from "../3d/Rules";
import { Schedules } from "../Schedules";
import type { Focus } from "../sound/song/Focus";

type Transform = {
    position: Vector3,
    rotation: Quaternion
}

function rad(degrees: number) {
    return degrees * (Math.PI / 180)
}

export class CameraRig extends Component {

    private _camera: PerspectiveCamera
    private _focusCoroutine: Coroutine | null = null

    constructor(engine: Engine, camera: PerspectiveCamera) {
        super(engine)
        this._camera = camera
        Object.assign(window, { rig: this })
    }

    private _clampFocus(focus: Focus): Focus {
        const distance = focus.highFret - focus.lowFret
        if (distance < 5) {
            // Shall expand focus
            const middle = (focus.highFret + focus.lowFret) / 2

            return {
                lowFret: middle - 2.5,
                highFret: middle + 2.5
            }
        }

        return focus
    }

    focus(focus: Focus) {
        focus = this._clampFocus(focus)

        const { position, rotation } = this._getFocusTransform(focus)
        this._camera.position.copy(position)
        this._camera.quaternion.copy(rotation)

        if (this._focusCoroutine) {
            this._focusCoroutine.cancel()
            this._focusCoroutine = null
        }
    }

    transition(focus: Focus, duration: Duration) {
        focus = this._clampFocus(focus)

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
        const a = Rules.getX(focus.lowFret - 1.5)
        const b = Rules.getX(focus.highFret + 1.5)
        // const c = Rules.getY(1) - 0.5

        const D = b - a

        const fov = rad(this._camera.fov) / 2
        const alpha = Math.atan(this._camera.aspect * Math.tan(fov))
        const beta = rad(5)
        const gamma = rad(12)

        const k = Math.tan(alpha + beta) / (Math.tan(alpha - beta) + Math.tan(alpha + beta))
        const d = k * D / Math.tan(alpha + beta)

        const position = new Vector3()
        position.x = k * D + a
        position.z = d
        position.y = d * 0.6

        const rotation = new Quaternion()
        rotation.setFromEuler(new Euler(-gamma, beta, 0))

        return { rotation, position }
    }

}