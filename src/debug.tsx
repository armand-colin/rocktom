import { Engine } from '@niloc/ecs'
import { EngineContext } from '@niloc/ecs-react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Slider, SliderScale } from './ui/slider/Slider'
import { useState } from 'react'
import "./debug.css"
import { Icon } from './ui/icon/Icon'

const engine = new Engine()

createRoot(document.getElementById('root')!).render(
  <EngineContext.Provider value={{ engine }}>
    <h1>Debug</h1>
    <Debug />
  </EngineContext.Provider>
)

function Debug() {
    const [v1, sv1] = useState(0)
    return <div className="Debug">
        <Slider value={v1} onChange={sv1} min={0} max={100} />
        <Slider value={v1} onChange={sv1} min={0} max={100} scale={SliderScale.exponential(2)}/>
        <Slider value={v1} onChange={sv1} min={0} max={100} scale={SliderScale.exponential(2)} step={1} />
        <Slider value={v1} onChange={sv1} min={0} max={100} scale={SliderScale.exponential(5)} />
        <p>{v1}</p>

        <Icon name="home" />
    </div>
}