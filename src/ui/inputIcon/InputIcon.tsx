import { useResource } from "@niloc/ecs-react";
import { InputManager, type Input } from "../../resources/InputManager";
import "./InputIcon.scss"

export function InputIcon(props: { input: Input }) {
    const inputManager = useResource(InputManager)

    return <div className="InputIcon">
        {inputManager.getKey(props.input).icon}
    </div>
}