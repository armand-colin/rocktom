import { Engine, Resource } from "@niloc/ecs";
import { Bass } from "../sound/instrument/Instrument";
import { BoxGeometry, Mesh, MeshStandardMaterial } from "three";
import type { String } from "../sound/instrument/String";
import { Rules } from "../3d/Rules";

export class NoteMeshes extends Resource {

    private _materials: Map<String, MeshStandardMaterial> = new Map()
    private _geometry: BoxGeometry

    constructor(engine: Engine) {
        super(engine)

        this._geometry = new BoxGeometry(Rules.fretWidth * 0.6, Rules.stringDistance * 0.4, 0.1)

        this._materials.set(Bass.E, new MeshStandardMaterial({ color: Bass.E.color }))
        this._materials.set(Bass.A, new MeshStandardMaterial({ color: Bass.A.color }))
        this._materials.set(Bass.D, new MeshStandardMaterial({ color: Bass.D.color }))
        this._materials.set(Bass.G, new MeshStandardMaterial({ color: Bass.G.color }))
    }

    createMesh(string: String): Mesh {
        const material = this._materials.get(string)
        if (!material) 
            throw new Error(`No mesh found for string ${string.name}`)

        return new Mesh(this._geometry, material)
    }

}