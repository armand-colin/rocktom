import { useEffect } from "react";
import { Instance } from "../Instance";
import { ShortcutManager } from "../resources/shortcut/ShortcutManager";
import type { Shortcut } from "../resources/shortcut/Shortcut";

export function useShortcut(shortcut: Shortcut, callback: () => void, options?: { enabled: boolean }) {
    const shortcutManager = Instance.engine.getResource(ShortcutManager)
    const enabled = options?.enabled ?? true

    useEffect(() => {
        if (!enabled)
            return

        shortcutManager.register(shortcut, callback)

        return () => {
            shortcutManager.unregister(shortcut, callback)
        }
    }, [shortcutManager, enabled])
}