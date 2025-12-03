import { EngineContext } from "@niloc/ecs-react";
import { useContext } from "react";
import { PopupManager } from "../resources/PopupManager";

export function usePopupManager() {
    const { engine } = useContext(EngineContext)
    return engine.getResource(PopupManager)
}