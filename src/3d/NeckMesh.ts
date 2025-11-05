import { BoxGeometry, Material, Mesh, MeshBasicMaterial, Object3D, TextureLoader } from "three"
import stringTextureImage from "../assets/string.png"
import type { NoteMeshes } from "../resources/NoteMeshes"
import type { Instrument } from "../sound/instrument/Instrument"
import type { String } from "../sound/instrument/String"
import { Rules } from "./Rules"

const materials = new Map<String, MeshBasicMaterial>()
const stringTexture = new TextureLoader().load(stringTextureImage)
stringTexture.repeat.set(50, 1)
stringTexture.wrapS = stringTexture.wrapT = 1000 // RepeatWrapping

function getMaterial(string: String): Material {
    let material = materials.get(string)
    if (!material) {
        material = new MeshBasicMaterial({ map: stringTexture })
        materials.set(string, material)
    }
    return material
}

const stringLength = Rules.maxFret * Rules.fretWidth
const stringGeometry = new BoxGeometry(stringLength, 0.05, 0.05)
const verticalStringLength = 100
const verticalStringGeometry = new BoxGeometry(0.05, 0.05, verticalStringLength)

function createTextMesh(fret: number, noteMeshes: NoteMeshes) {
    const mesh = noteMeshes.createFretMesh(fret)
    mesh.position.x = Rules.getX(fret)
    return mesh
}

function create(instrument: Instrument, noteMeshes: NoteMeshes) {
    const neck = new Object3D()

    for (const string of instrument.strings) {
        const material = getMaterial(string)
        const stringMesh = new Mesh(stringGeometry, material)
        neck.add(stringMesh)
        // Centered y
        stringMesh.position.y = Rules.getY(instrument, string)
        stringMesh.position.x = Rules.getX(Rules.maxFret / 2 + 0.5)
    }

    const fretGeometry = new BoxGeometry(0.1, (instrument.strings.length - 1) * Rules.stringDistance, 0.1)
    const fretMaterial = new MeshBasicMaterial({ color: 0x888888 })

    for (let i = 0; i <= Rules.maxFret; i++) {
        const fretMesh = new Mesh(fretGeometry, fretMaterial)
        neck.add(fretMesh)
        fretMesh.position.x = Rules.getX(i + 0.5)
        fretMesh.position.y = 0
    }

    const verticalStringMaterial = new MeshBasicMaterial({ color: 0x444444 })
    // Shall create vertical frets
    for (let i = 0; i <= Rules.maxFret; i++) {
        const verticalStringMesh = new Mesh(verticalStringGeometry, verticalStringMaterial)
        neck.add(verticalStringMesh)
        verticalStringMesh.position.x = Rules.getX(i + 0.5)
        verticalStringMesh.position.y = Rules.getY(instrument, instrument.strings[instrument.strings.length - 1])
    }

    // Add fret numbers
    neck.add(createTextMesh(3, noteMeshes))
    neck.add(createTextMesh(5, noteMeshes))
    neck.add(createTextMesh(7, noteMeshes))
    neck.add(createTextMesh(9, noteMeshes))
    neck.add(createTextMesh(12, noteMeshes))
    neck.add(createTextMesh(15, noteMeshes))

    return neck
}

export const NeckMesh = {
    create
}