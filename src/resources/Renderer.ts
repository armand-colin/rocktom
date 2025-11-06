import { Engine, Resource } from "@niloc/ecs"
import { Coroutine, Vec2 } from "@niloc/utils"
import { HalfFloatType, Layers, Material, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, ShaderMaterial, Scene as ThreeScene, Vector2, WebGLRenderer, WebGLRenderTarget } from "three"
import { Schedules } from "../Schedules"
import { EffectComposer, OutputPass, RenderPass, ShaderPass, UnrealBloomPass } from "three/examples/jsm/Addons.js"
import vertexShader from "./shaders/vertex.glsl?raw"
import fragmentShader from "./shaders/fragment.glsl?raw"
import { Bloom } from "../3d/Bloom"
export class Renderer extends Resource {

    private _scene: ThreeScene
    private _camera: PerspectiveCamera

    private _renderCoroutine: Coroutine
    private _windowSize: Vec2

    private _renderer: WebGLRenderer

    private _materials: Record<string, Material | Material[]> = {}
    private _renderPass: RenderPass
    private _bloomPass: UnrealBloomPass
    private _darkMaterial: Material
    private _bloomRenderTarget: WebGLRenderTarget
    private _bloomComposer: EffectComposer
    private _finalComposer: EffectComposer
    private _bloomLayers: Layers

    constructor(engine: Engine) {
        super(engine)

        this._windowSize = Vec2.create(window.innerWidth, window.innerHeight)

        this._scene = new ThreeScene()
        this._camera = new PerspectiveCamera(75, this._windowSize.x / this._windowSize.y, 0.1, 1000)
        this._camera.position.x = 0
        this._camera.position.z = 7
        this._camera.position.y = 4

        this._renderer = new WebGLRenderer({
            alpha: true,
            antialias: true
        })

        this._renderer.setSize(this._windowSize.x, this._windowSize.y)
        // this._renderer.setPixelRatio(window.devicePixelRatio)

        this._renderPass = new RenderPass(this._scene, this._camera)

        this._darkMaterial = new MeshBasicMaterial({ color: "black" })

        const params = {
            threshold: 0,
            strength: 0.5,
            radius: 0.3,
            exposure: 0.6
        }

        this._bloomLayers = Bloom.createLayers()

        this._bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
        this._bloomPass.threshold = params.threshold
        this._bloomPass.strength = params.strength
        this._bloomPass.radius = params.radius

        this._bloomRenderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, { type: HalfFloatType })
        this._bloomComposer = new EffectComposer(this._renderer, this._bloomRenderTarget)
        this._bloomComposer.renderToScreen = false
        this._bloomComposer.addPass(this._renderPass)
        this._bloomComposer.addPass(this._bloomPass)
        // this._bloomComposer.setPixelRatio(window.devicePixelRatio)

        const mixPass = new ShaderPass(
            new ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this._bloomComposer.renderTarget2.texture },
                    bloomStrength: { value: params.strength }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                defines: {}
            }), 'baseTexture'
        )
        mixPass.needsSwap = true

        const outputPass = new OutputPass()

        const finalRenderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, { type: HalfFloatType, samples: 4 })
        this._finalComposer = new EffectComposer(this._renderer, finalRenderTarget);
        this._finalComposer.addPass(this._renderPass)
        this._finalComposer.addPass(mixPass)
        this._finalComposer.addPass(outputPass)
        // this._finalComposer.setPixelRatio(window.devicePixelRatio)

        this._renderCoroutine = engine.scheduler.add(this._render())
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
            this._scene.traverse(this._darkenNonBloomed)
            this._bloomComposer.render()
            this._scene.traverse(this._restoreMaterial)

            // render the entire scene, then render bloom scene on top
            this._finalComposer.render()
        }
    }

    private _darkenNonBloomed = (object: Object3D) => {
        if (
            (object as unknown as { isMesh: boolean }).isMesh && 
            !this._bloomLayers.test(object.layers)
        ) {
            const mesh = object as Mesh
            this._materials[object.uuid] = mesh.material;
            mesh.material = this._darkMaterial
        }
    }

    private _restoreMaterial = (object: Object3D) => {
        if (
            (object as unknown as { isMesh: boolean }).isMesh && 
            this._materials[object.uuid]
        ) {
            const mesh = object as Mesh
            mesh.material = this._materials[object.uuid]
            delete this._materials[object.uuid]
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