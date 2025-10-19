import type { ChangeEvent } from 'react'
import './App.css'
import { Engine } from './engine/Engine'
import { useResource } from './engine/hooks'
import { MediaStreamList } from './resources/MediaStreamList'
import { NoteDetector } from './resources/NoteDetector'
import { Tuner } from './resources/Tuner'
import { Workspace } from './resources/Workspace'
import { MidiParser } from './sound/MidiParser'
import { MusicSheet } from './sound/MusicSheet'
import { Playback } from './components/Playback'
import { MidiEvent } from './sound/MidiEvent'
import { Player } from './resources/Player'
import { PlaybackView } from './ui/PlaybackView'

import timeIsRunningOutMidi from "./assets/TimeIsRunningOut.mid?url"
// import timeIsRunningOutMidi from "./assets/Test2.mid?url"
import timeIsRunningOutMp3 from "./assets/TimeIsRunningOut.mp3"

function App() {
  const mediaStramList = useResource(MediaStreamList)
  const workspace = useResource(Workspace)
  const { detectedFrequency } = useResource(Tuner)
  const { detectedNotes } = useResource(NoteDetector)
  const player = useResource(Player)

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
    const midi = await fetch(timeIsRunningOutMidi)
      .then(response => response.blob())
      .then(blob => blob.arrayBuffer())
      .then(buffer => new MidiParser(new Uint8Array(buffer)))

    const sheet = MusicSheet.fromMidi(midi)
    console.log(sheet, midi)

    const audioBuffer = await fetch(timeIsRunningOutMp3)
      .then(response => response.arrayBuffer())
      .then(buffer => Engine.instance.sound.createAudioBuffer(buffer))

    const playback = Engine.instance.createComponent(
      Playback,
      sheet,
      audioBuffer,
      1.51,
      {
        type: MidiEvent.InstrumentType.SynthBass,
        stringsChannel: [0, 4, 8, 12]
      }
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
      <button onClick={() => Engine.instance.sound.resume()}>resume</button>
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
      {
        player.playback ?
          <PlaybackView playback={player.playback} /> :
          undefined
      }
    </div>
  )
}

export default App
