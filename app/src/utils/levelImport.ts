import { Level } from "../sound/Level"

export type ImportedLevelTracks = {
    serialized: string,
    duration: number,
    playbackId: string | null,
    instrumentTypes: string[],
}

export function parseImportedLevelTracks(content: string): ImportedLevelTracks {
    const json = JSON.parse(content)
    const tracks = Level.deserializeTracks(json)
    const level = new Level({
        id: "import",
        name: "import",
        tracks,
    })

    return {
        serialized: JSON.stringify(json),
        duration: Math.round(level.durationInSeconds),
        playbackId: null,
        instrumentTypes: level.getInstrumentTypes(),
    }
}
