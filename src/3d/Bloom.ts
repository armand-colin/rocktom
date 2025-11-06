import { Layers, type Object3D } from "three"

const SCENE = 1

function enable(object: Object3D) {
    object.layers.enable(SCENE)
    object.traverse(child => child.layers.enable(SCENE))
}

function disable(object: Object3D) {
    object.layers.disable(SCENE)
    object.traverse(child => child.layers.disable(SCENE))
}

function createLayers() {
    const layer = new Layers()
    layer.set(SCENE)
    return layer
}

export const Bloom = {
    enable,
    disable,
    createLayers
}