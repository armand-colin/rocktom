import { useSyncExternalStore } from "react";
import "./Icon.scss";

const ICONS_FONT = '1em Icons';

let iconsFontLoaded = typeof document !== "undefined" && document.fonts.check(ICONS_FONT);
let iconsFontPromise: Promise<void> | null = null;
const iconsFontListeners = new Set<() => void>();

function subscribeIconsFont(listener: () => void) {
    iconsFontListeners.add(listener);

    if (!iconsFontLoaded && !iconsFontPromise) {
        iconsFontPromise = document.fonts.load(ICONS_FONT).then(() => {
            iconsFontLoaded = true;
            iconsFontListeners.forEach(notify => notify());
        });
    }

    return () => iconsFontListeners.delete(listener);
}

function getIconsFontSnapshot() {
    return iconsFontLoaded;
}

export type IconName =
    "home" |
    "volume_up" |
    "volume_off" |
    "space_bar" |
    "shift" |
    "arrow_back" |
    "code" |
    "arrow_drop_down" |
    "close" |
    "acute" |
    "instant_mix" |
    "progress_activity" |
    "play_arrow" |
    "edit" |
    "more_vert"

type Props = {
    name: IconName
}

export function Icon(props: Props) {
    const loaded = useSyncExternalStore(
        subscribeIconsFont,
        getIconsFontSnapshot,
        () => false,
    );

    return <i 
        className="Icon"
        data-icon={props.name}
        data-loaded={loaded || undefined}
    >
        {props.name}
    </i>
}