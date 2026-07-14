import type { ReactNode } from "react";
import type { IconName } from "../../ui/icon/Icon";

export type ContextualMenuItem = {
    type: 'action',
    icon?: IconName,
    theme?: "danger",
    label: string,
    action: () => void,
} | {
    type: 'separator',
} | {
    type: 'custom',
    component: (close: () => void) => ReactNode,
}

export namespace ContextualMenuItem {

    export function action(options: {
        icon?: IconName,
        theme?: "danger",
        label: string,
        action: () => void,
    }): ContextualMenuItem {
        return {
            type: 'action',
            icon: options.icon,
            label: options.label,
            theme: options.theme,
            action: options.action,
        }
    }

    export function separator(): ContextualMenuItem {
        return {
            type: 'separator',
        }
    }

    export function custom(component: (close: () => void) => ReactNode): ContextualMenuItem {
        return {
            type: 'custom',
            component,
        }
    }

}