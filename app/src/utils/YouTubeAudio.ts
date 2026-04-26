import type { Engine } from "@niloc/ecs";
import { Duration } from "@niloc/utils";
import { YoutubePlayer } from "../resources/YoutubePlayer";

async function getDuration(engine: Engine, youtubeVideoId: string): Promise<Duration> {
    const player = engine.getResource(YoutubePlayer)
    await player.load(youtubeVideoId)
    const seconds = await player.getDuration()
    return Duration.fromSeconds(seconds)
}

export const YouTubeAudio = {
    getDuration,
}