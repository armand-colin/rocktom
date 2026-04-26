import { useContext } from 'react'
import { EngineContext, useResource } from '@niloc/ecs-react'
import { Playback } from '../components/Playback'
import { SoundEngine } from '../resources/SoundEngine'
import { State } from '../resources/State'
import { Bass } from '../sound/instrument/Instrument'
import { Level } from '../sound/Level'
import { PlaybackView } from '../ui/PlaybackView'
import { ContextualMenuView } from '../ui/contextualMenuView/ContextualMenuView'
import { LevelEditorView } from '../ui/levelEditor/LevelEditorView'
import { LevelList } from '../ui/levelList/LevelList'
import { PopupManagerView } from '../ui/popup/PopupManagerView'
import { WindowManagerView } from '../ui/window/WindowManagerView'
import '../App.css'

export function Home() {
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
      <ContextualMenuView />
    </div>
  )
}
