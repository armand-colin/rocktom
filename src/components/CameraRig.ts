import { Component, Engine } from "@niloc/ecs";
import type { Coroutine } from "@niloc/utils";
import { Animation, AnimationCurve, Duration } from "@niloc/utils";
import { Euler, log, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { Rules } from "../3d/Rules";
import { Schedules } from "../Schedules";
import type { Focus } from "../sound/song/Focus";
import { Bass } from "../sound/instrument/Instrument";

type Transform = {
    position: Vector3,
    rotation: Quaternion
}

function rad(degrees: number) {
    return degrees * (Math.PI / 180)
}

function deg(radians: number) {
    return radians * (180 / Math.PI)
}


export class CameraRig extends Component {

    private _camera: PerspectiveCamera
    private _focusCoroutine: Coroutine | null = null

    constructor(engine: Engine, camera: PerspectiveCamera) {
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
        const a = Rules.getX(focus.lowFret - 2.5)
        const b = Rules.getX(focus.highFret + 2.5)
        const c = Rules.getY(1) - 0.5

        const D = b - a

        const fov = rad(this._camera.fov) / 2
        const alpha = Math.atan(this._camera.aspect * Math.tan(fov))
        const beta = rad(5)
        const gamma = rad(15)

        const k = Math.tan(alpha + beta) / (Math.tan(alpha - beta) + Math.tan(alpha + beta))
        const d = Math.max(k * D / Math.tan(alpha + beta), 4)

        const position = new Vector3()
        position.x = k * D + a
        position.z = d
        position.y = 2.6

        const rotation = new Quaternion()
        rotation.setFromEuler(new Euler(-gamma, beta, 0))

        return { rotation, position }
    }

}