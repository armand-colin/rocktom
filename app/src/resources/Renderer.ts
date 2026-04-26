import { Engine, Resource } from "@niloc/ecs"
import { Coroutine, Emitter, Vec2 } from "@niloc/utils"
import { Object3D, PerspectiveCamera, Scene as ThreeScene, WebGLRenderer } from "three"
import { Schedules } from "../Schedules"
export class Renderer extends Resource {

    private _scene: ThreeScene
    private _camera: PerspectiveCamera

    private _renderCoroutine: Coroutine
    private _windowSize: Vec2

    private _renderer: WebGLRenderer

    readonly event = new Emitter<{ resize: undefined }>()

    constructor(engine: Engine) {
        super(engine)

        this._windowSize = Vec2.create(window.innerWidth, window.innerHeight)

        this._scene = new ThreeScene()
        this._camera = new PerspectiveCamera(60, this._windowSize.x / this._windowSize.y, 0.1, 1000)

        this._renderer = new WebGLRenderer({
            alpha: true,
            antialias: true
        })

        this._renderer.setSize(this._windowSize.x, this._windowSize.y)
        this._renderer.setPixelRatio(window.devicePixelRatio)

        this._renderCoroutine = engine.scheduler.add(this._render())

        window.addEventListener('resize', this._onResize)
        this._onResize()
    }

    private _onResize = () => {
        this._windowSize = Vec2.create(window.innerWidth, window.innerHeight)
        this._camera.aspect = this._windowSize.x / this._windowSize.y
        this._camera.updateProjectionMatrix()

        this._renderer.setSize(this._windowSize.x, this._windowSize.y)
        this.event.emit('resize')
    }

    get element() {
        return this._renderer.domElement
    }

    get camera() {
        return this._camera
    }

    private *_render() {
        while (true) {
            yield Schedules.AfterFrame
            this._renderer.render(this._scene, this._camera)
        }
    }

    destroy() {
        this._renderCoroutine.cancel()
    }

    add(object: Object3D) {
        this._scene.add(object)
    }

    remove(object: Object3D) {
        this._scene.remove(object)
    }

}