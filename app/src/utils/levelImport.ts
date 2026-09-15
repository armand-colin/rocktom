import { Level } from "../sound/Level"

export type ImportedLevelTracks = {
    serialized: string,
    duration: number,
    playbackId: string | null,
    instrumentTypes: string[],
}

export function parseImportedLevelTracks(content: string): ImportedLevelTracks {
    const level = Level.deserialize({
        serialized: content,
        id: "import",
        name: "import",
    })

    return {
        serialized: JSON.stringify(level.serializeTracks()),
        duration: Math.round(level.durationInSeconds),
        playbackId: null,
        instrumentTypes: level.getInstrumentTypes(),
    }
}
