import { useContext, type ChangeEvent } from 'react'
import './App.css'
import { Playback } from './components/Playback'
import { MediaStreamList } from './resources/MediaStreamList'
import { NoteDetector } from './resources/NoteDetector'
import { Player } from './resources/Player'
import { Tuner } from './resources/Tuner'
import { Workspace } from './resources/Workspace'
import { PlaybackView } from './ui/PlaybackView'

import { timeIsRunningOut } from './levels/timeIsRunningOut'
import { EngineContext, useResource } from '@niloc/ecs-react'
import { SoundEngine } from './resources/SoundEngine'
import { Renderer } from './resources/Renderer'
import { ElementRenderer } from './ui/ElementRenderer'

function App() {
  const mediaStramList = useResource(MediaStreamList)
  const workspace = useResource(Workspace)
  const { detectedFrequency } = useResource(Tuner)
  const { detectedNotes } = useResource(NoteDetector)
  const player = useResource(Player)
  const { engine } = useContext(EngineContext)
  const renderer = engine.getResource(Renderer)

  function setStream(id: string) {
    mediaStramList.request(id).then(stream => {
      workspace.setMicrophoneStream(stream)
    })
  }

  function onGainChange(e: ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(e.target.value)
    workspace.feedbackGain = value
  }

  async function loadMidi() {
    const level = await timeIsRunningOut()


    const playback = engine.createComponent(
      Playback,
      level,
    )

    player.bind(playback)
  }

  return (
    <div className="app">
      <ul>
        {mediaStramList.streams.map(stream => (
          <li
            key={stream.id}
            onClick={() => setStream(stream.id)}
          >{stream.label || "Unknown"}</li>
        ))}
      </ul>
      <input type="range" min="0" max="10" value={workspace.feedbackGain} onChange={onGainChange} />
      <button onClick={() => mediaStramList.refresh()}>refresh</button>
      <button onClick={() => engine.getResource(SoundEngine).resume()}>resume</button>
      <p>Frequency: {detectedFrequency}Hz </p>
      <p>Detected notes: </p>
      <ul>
        {
          detectedNotes.map((note, i) => <li
            key={i}
          >
            {note.name}{note.octave} {note.cents}
          </li>)
        }
      </ul>
      <button onClick={loadMidi}>load midi</button>

      <ElementRenderer element={renderer.element} />
      
      {
        player.playback ?
          <PlaybackView playback={player.playback} /> :
          undefined
      }
    </div>
  )
}

export default App
