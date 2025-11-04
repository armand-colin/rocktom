import { Engine, Resource } from "@niloc/ecs";
import { BoxGeometry, Mesh, MeshStandardMaterial, Object3D, PlaneGeometry } from "three";
import { Font, FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";
import { Rules } from "../3d/Rules";
import font from "../assets/fonts/helvetiker.typeface.json?url";
import { Bass } from "../sound/instrument/Instrument";
import type { String } from "../sound/instrument/String";
export class NoteMeshes extends Resource {

    private _materials: Map<String, MeshStandardMaterial> = new Map()
    private _geometry: BoxGeometry
    private _font: Font | null = null
    private _textMaterial: MeshStandardMaterial
    private _tailGeometry: PlaneGeometry

    constructor(engine: Engine) {
        super(engine)

        this._textMaterial = new MeshStandardMaterial({ color: 0xffffff })
        this._geometry = new BoxGeometry(Rules.fretWidth * 0.6, Rules.stringDistance * 0.4, 0.1)
        this._tailGeometry = new PlaneGeometry(Rules.fretWidth * 0.4, 1)
        this._tailGeometry.rotateX(-Math.PI / 2)
        this._tailGeometry.translate(0, 0, -0.5)

        this._materials.set(Bass.E, new MeshStandardMaterial({ color: Bass.E.color, emissive: Bass.E.color, emissiveIntensity: 2 }))
        this._materials.set(Bass.A, new MeshStandardMaterial({ color: Bass.A.color }))
        this._materials.set(Bass.D, new MeshStandardMaterial({ color: Bass.D.color }))
        this._materials.set(Bass.G, new MeshStandardMaterial({ color: Bass.G.color }))
    }

    load() {
        const fontLoader = new FontLoader()
        fontLoader.load(font, font => {
            this._font = font
        })
    }

    createMesh(string: String): Mesh {
        const material = this._materials.get(string)
        if (!material)
            throw new Error(`No mesh found for string ${string.name}`)

        return new Mesh(this._geometry, material)
    }

    createTailGeometry(string: String, duration: number) {
        const length = duration * Rules.timeRatio
        const mesh = new Mesh(this._tailGeometry, this._materials.get(string)!)
        mesh.scale.z = length
        return mesh
    }

    createFretMesh(fret: number): Object3D {
        if (!this._font)
            throw new Error("Font not loaded yet")

        const object = new Object3D()

        const textGeometry = new TextGeometry(fret.toString(), {
            font: this._font,
            size: 0.2,
            depth: 0.01,
        })
        textGeometry.computeBoundingBox()
        textGeometry.center()
        const textMesh = new Mesh(textGeometry, this._textMaterial)
        object.add(textMesh)

        const outlineGeometry = new TextGeometry(fret.toString(), {
            font: this._font,
            size: 0.2,
            depth: 0.009,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0.03
        })
        outlineGeometry.computeBoundingBox()
        outlineGeometry.center()
        const outlineMesh = new Mesh(outlineGeometry, new MeshStandardMaterial({ color: 0x000000 }))
        object.add(outlineMesh)

        return object
    }

}