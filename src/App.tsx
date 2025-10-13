import type { ChangeEvent } from 'react'
import './App.css'
import { Engine } from './engine/Engine'
import { useResource } from './engine/hooks'
import { MediaStreamList } from './resources/MediaStreamList'
import { Tuner } from './resources/Tuner'
import { Workspace } from './resources/Workspace'

function App() {
  const mediaStramList = useResource(MediaStreamList)
  const workspace = useResource(Workspace)
  const { detectedFrequency } = useResource(Tuner)

  function setStream(id: string) {
    mediaStramList.request(id).then(stream => {
      workspace.setMicrophoneStream(stream)
    })
  }

  function onGainChange(e: ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(e.target.value)
    workspace.feedbackGain = value
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
      <button onClick={() => Engine.instance.sound.resume()}>resume</button>
      <p>Frequency: {detectedFrequency}Hz </p>
    </div>
  )
}

export default App
