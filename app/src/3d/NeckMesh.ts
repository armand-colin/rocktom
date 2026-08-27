import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, type BufferGeometry } from "three"
import type { Instrument } from "../sound/instrument/Instrument"
import { FretMesh } from "./FretMesh"
import { Rules } from "./Rules"
import { AtlasSprite, TextureAtlas, TextureColorIndex } from "./TextureAtlas"

const stringLength = Rules.maxFret * Rules.fretWidth
const verticalStringLength = 100
const verticalStringGeometry = new BoxGeometry(0.04, 0.04, verticalStringLength)
const stringGeometries = new Map<number, BufferGeometry>()

function createStringGeometry(colorIndex: TextureColorIndex) {
    let geometry = stringGeometries.get(colorIndex)
    if (geometry)
        return geometry

    geometry = new BoxGeometry(stringLength, 0.05, 0.05, TextureAtlas.stringTiles, 1, 1).toNonIndexed()
    TextureAtlas.get().applyTiledUvs(geometry, AtlasSprite.String, colorIndex)
    stringGeometries.set(colorIndex, geometry)
    return geometry
}

function createTextMesh(fret: number) {
    const mesh = FretMesh.create(fret)
    mesh.position.x = Rules.getX(fret)
    mesh.position.z = -0.01
    return mesh
}

function create(instrument: Instrument) {
    const neck = new Object3D()
    neck.name = "Neck"

    const atlas = TextureAtlas.get()

    for (const string of instrument.strings) {
        const stringMesh = new Mesh(createStringGeometry(string.colorIndex), atlas.material)
        stringMesh.name = "String " + string.name

        neck.add(stringMesh)
        stringMesh.position.y = Rules.getStringY(instrument, string)
        stringMesh.position.x = Rules.getX(Rules.maxFret / 2 + 0.5)
    }

    const fretGeometry = new BoxGeometry(0.04, Rules.neckHeight, 0.04)
    const fretMaterial = new MeshBasicMaterial({ color: 0x888888 })

    for (let i = 0; i <= Rules.maxFret; i++) {
        const fretMesh = new Mesh(fretGeometry, fretMaterial)
        fretMesh.name = "Fret " + (i + 1)
        neck.add(fretMesh)
        fretMesh.position.x = Rules.getX(i + 0.5)
        fretMesh.position.y = 0
    }

    const verticalStringMaterial = new MeshBasicMaterial({ color: 0x444444 })
    for (let i = 0; i <= Rules.maxFret; i++) {
        const verticalStringMesh = new Mesh(verticalStringGeometry, verticalStringMaterial)
        verticalStringMesh.name = "Vertical fret hint " + (i + 1)
        neck.add(verticalStringMesh)
        verticalStringMesh.position.x = Rules.getX(i + 0.5)
        verticalStringMesh.position.y = Rules.getY(1)
    }

    neck.add(createTextMesh(3))
    neck.add(createTextMesh(5))
    neck.add(createTextMesh(7))
    neck.add(createTextMesh(9))
    neck.add(createTextMesh(12))
    neck.add(createTextMesh(15))

    return neck
}

export const NeckMesh = {
    create
}
