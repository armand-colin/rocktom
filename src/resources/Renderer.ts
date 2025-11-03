import { Engine, Resource } from "@niloc/ecs";
import { Coroutine, Schedule, Vec2 } from "@niloc/utils";
import { Scene as ThreeScene, PerspectiveCamera, WebGLRenderer, Object3D, AmbientLight, Vector3 } from "three"
import { Rules } from "../3d/Rules";

const SIZE = Vec2.create(500, 300)

export class Renderer extends Resource {

    private _scene: ThreeScene
    private _camera: PerspectiveCamera
    private _renderer: WebGLRenderer

    private _renderSchedule: Schedule
    private _renderCoroutine: Coroutine

    constructor(engine: Engine) {
        super(engine)

        this._renderSchedule = Schedule.after(Schedule.Frame)
        this._scene = new ThreeScene()
        this._camera = new PerspectiveCamera(75, SIZE.x / SIZE.y, 0.1, 1000)
        this._camera.position.x = 0
        this._camera.position.z = 10
        this._camera.position.y = Rules.stringDistance * 2
        this._camera.lookAt(new Vector3(0, 0, 0))

        const light = new AmbientLight(0xFFFFFF)
        this._scene.add(light)

        this._renderer = new WebGLRenderer()
        this._renderer.setSize(SIZE.x, SIZE.y)
        this._renderCoroutine = engine.scheduler.add(this._render())


    }

    get element() {
        return this._renderer.domElement
    }

    private *_render() {
        while (true) {
            // Do the actual rendering
            this._renderer.render(this._scene, this._camera)
            // Wait until the next frame
            yield this._renderSchedule
        }
    }

    add(object: Object3D) {
        this._scene.add(object)
    }

}