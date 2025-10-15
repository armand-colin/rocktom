import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import test from "./assets/test.mid?url"
import { MidiParser } from './sound/MidiParser.ts'
import { MusicSheet } from './sound/MusicSheet.ts'

fetch(test)
  .then(response => response.blob())
  .then(blob => blob.arrayBuffer())
  .then(buffer => new MidiParser(new Uint8Array(buffer)))
  .then(parser => {
    const sheet = MusicSheet.fromMidi(parser)
    console.log(parser, sheet)
  })
  .then(console.log)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)