import { useContext } from 'react'
import './App.css'
import { Playback } from './components/Playback'
import { Player } from './resources/Player'
import { PlaybackView } from './ui/PlaybackView'

import { EngineContext, useResource } from '@niloc/ecs-react'
import { demo } from './levels/demo'
import { liz } from './levels/liz'
import { timeIsRunningOut } from './levels/timeIsRunningOut'
import { SoundEngine } from './resources/SoundEngine'
import { Level } from './sound/Level'
import { LevelList } from './ui/levelList/LevelList'
import { State } from './resources/State'
import { LevelEditorView } from './ui/levelEditor/LevelEditorView'
import { Bass } from './sound/instrument/Instrument'

const levels = [
  liz(),
  timeIsRunningOut(),
  demo()
]

function App() {
  const { engine } = useContext(EngineContext)
  const { playback } = useResource(Player)
  const state = useResource(State)
  const { editor } = state

  async function onSelectLevel(level: Level) {
    engine.getResource(SoundEngine).resume()

    const playback = engine.createComponent(
      Playback,
      level,
    )

    const player = engine.getResource(Player)
    player.bind(playback)
  }

  function onCreate() {
    const level = Level.create(new Bass())
    state.editLevel(level)
  }

  return (
    <div className="App">
      {
        editor ?
          <LevelEditorView editor={editor} /> :
          playback ?
            <PlaybackView playback={playback} /> :
            <LevelList 
              onSelect={onSelectLevel} 
              levels={levels} 
              onCreate={onCreate}
            />
      }
    </div>
  )
}

export default App
