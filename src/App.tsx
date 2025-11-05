import { useContext } from 'react'
import './App.css'
import { Playback } from './components/Playback'
import { Player } from './resources/Player'
import { PlaybackView } from './ui/PlaybackView'

import { EngineContext, useResource } from '@niloc/ecs-react'
import { LevelList } from './LevelList'
import { liz } from './levels/liz'
import { timeIsRunningOut } from './levels/timeIsRunningOut'
import { SoundEngine } from './resources/SoundEngine'
import type { Level } from './sound/Level'

const levels = [
  liz(),
  timeIsRunningOut()
]

function App() {
  const { engine } = useContext(EngineContext)
  const { playback } = useResource(Player)

  async function onSelectLevel(level: Level) {
    engine.getResource(SoundEngine).resume()

    const playback = engine.createComponent(
      Playback,
      level,
    )

    const player = engine.getResource(Player)
    player.bind(playback)
  }

  return (
    <div className="app">
      {
        playback ?
          <PlaybackView playback={playback} /> :
          <LevelList onSelect={onSelectLevel} levels={levels} />
      }
    </div>
  )
}

export default App
