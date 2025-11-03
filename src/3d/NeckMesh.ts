import { BoxGeometry, Mesh, MeshStandardMaterial, Object3D } from "three";
import type { Instrument } from "../sound/instrument/Instrument";
import type { String } from "../sound/instrument/String";
import { Rules } from "./Rules";

const materials = new Map<String, MeshStandardMaterial>()

function getMaterial(string: String): MeshStandardMaterial {
    let material = materials.get(string)
    if (!material) {
        material = new MeshStandardMaterial({ color: string.color })
        materials.set(string, material)
    }
    return material
}

const stringLength = Rules.maxFret * Rules.fretWidth
const stringGeometry = new BoxGeometry(stringLength, 0.1, 0.1)

function create(instrument: Instrument) {
    const neck = new Object3D()

    for (const string of instrument.strings) {
        const material = getMaterial(string)
        const stringMesh = new Mesh(stringGeometry, material)
        neck.add(stringMesh)
        // Centered y
        stringMesh.position.y = Rules.getY(instrument, string)
        stringMesh.position.x = 0
    }


    const fretGeometry = new BoxGeometry(0.1, (instrument.strings.length - 1) * Rules.stringDistance, 0.1)
    const fretMaterial = new MeshStandardMaterial({ color: 0x888888 })

    for (let i = 0; i <= Rules.maxFret; i++) {
        const fretMesh = new Mesh(fretGeometry, fretMaterial)
        neck.add(fretMesh)
        fretMesh.position.x = Rules.getX(i)
        fretMesh.position.y = 0
    }

    return neck
}

export const NeckMesh = {
    create
}