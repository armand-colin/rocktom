import { EngineContext } from "@niloc/ecs-react";
import { useContext } from "react";
import { ToastManager } from "../resources/ToastManager";

export function useToastManager() {
    const { engine } = useContext(EngineContext)
    return engine.getResource(ToastManager)
}
