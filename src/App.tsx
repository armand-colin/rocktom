import { useContext } from 'react'
import './App.css'
import { Playback } from './components/Playback'
import { PlaybackView } from './ui/PlaybackView'

import { EngineContext, useResource } from '@niloc/ecs-react'
import { SoundEngine } from './resources/SoundEngine'
import { State } from './resources/State'
import { Bass } from './sound/instrument/Instrument'
import { Level } from './sound/Level'
import { LevelEditorView } from './ui/levelEditor/LevelEditorView'
import { LevelList } from './ui/levelList/LevelList'
import { PopupManagerView } from './ui/popup/PopupManagerView'
import { WindowManagerView } from './ui/window/WindowManagerView'

function App() {
  const { engine } = useContext(EngineContext)
  const state = useResource(State)
  const { editor, playback } = state

  async function onSelectLevel(level: Level) {
    engine.getResource(SoundEngine).resume()

    const playback = engine.createComponent(
      Playback,
      level,
    )

    state.setPlayback(playback)
  }

  function onCreate() {
    const level = Level.create(new Bass())
    state.editLevel(level)
  }

  return (
    <div
      className="App"
      onContextMenu={e => e.preventDefault()}
    >
      {
        editor ?
          <LevelEditorView editor={editor} /> :
          playback ?
            <PlaybackView playback={playback} /> :
            <LevelList
              onSelect={onSelectLevel}
              onCreate={onCreate}
              onEdit={level => state.editLevel(level)}
              onClone={level => state.cloneLevel(level)}
            />
      }

      <WindowManagerView />
      <PopupManagerView />
    </div>
  )
}

export default App
