import { useState } from "react";
import { OTPInput } from "./OTPInput";
import { Button } from "../../button/Button";

export default {
    title: "Input/OTPInput",
    component: OTPInput,
}

export const Default = () => {
    const [value, setValue] = useState("")

    return <div className="p-5">
        <div className="w-60">
            <OTPInput
                className="w-full"
                length={6}
                value={value}
                onChange={setValue}
            />
        </div>
        <div>
            124532
            <Button onClick={() => navigator.clipboard.writeText("123456")}>Copy</Button>
        </div>
    </div>
}