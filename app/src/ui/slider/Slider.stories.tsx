import { useState } from "react"
import { Slider } from "./Slider"

export default {
    title: "Slider",
    component: Slider,
    argTypes: {
        disabled: { control: "boolean" },
    }
}

export const Default = (args: any) => {
    const [value, setValue] = useState(0)

    return <div>
        <Slider
            value={value}
            onChange={setValue}
            min={0}
            max={100}
            {...args}
        />
    </div>
}