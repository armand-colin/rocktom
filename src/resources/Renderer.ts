import { Engine, Resource } from "@niloc/ecs";
import { Coroutine, Schedule, Vec2 } from "@niloc/utils";
import { DirectionalLight, Object3D, PerspectiveCamera, Scene as ThreeScene, WebGLRenderer } from "three";
export class Renderer extends Resource {

    private _scene: ThreeScene
    private _camera: PerspectiveCamera
    private _renderer: WebGLRenderer

    private _renderSchedule: Schedule
    private _renderCoroutine: Coroutine
    private _windowSize: Vec2

    constructor(engine: Engine) {
        super(engine)

        this._windowSize = Vec2.create(window.innerWidth, window.innerHeight)

        this._renderSchedule = Schedule.after(Schedule.Frame)
        this._scene = new ThreeScene()
        this._camera = new PerspectiveCamera(75, this._windowSize.x / this._windowSize.y, 0.1, 1000)
        this._camera.position.x = 0
        this._camera.position.z = 7
        this._camera.position.y = 4
        // this._camera.lookAt(new Vector3(0, 2, -15))

        const light = new DirectionalLight(0xFFFFFF)
        this._scene.add(light)
        light.position.set(1, 2, 3)

        this._renderer = new WebGLRenderer()
        this._renderer.setSize(this._windowSize.x, this._windowSize.y)
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