import { useState } from "react";
import { Toggle } from "./Toggle";

export default {
    title: "Toggle",
    component: Toggle,
}

export const Default = () => {
    const [value, setValue] = useState(false)

    return <div>
        <Toggle value={value} onChange={setValue} />
    </div>
}