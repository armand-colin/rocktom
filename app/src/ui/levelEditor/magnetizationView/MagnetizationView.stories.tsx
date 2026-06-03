import { useMemo } from "react";
import { TimeTransform } from "../../../components/editor/TimeTransform";
import { Instance } from "../../../Instance";
import { MagnetizationView } from "./MagnetizationView";

export default {
    title: "MagnetizationView",
}

export const Template = () => {
    const transform = useMemo(
        () => Instance.engine.createComponent(TimeTransform),
        []
    )

    return <MagnetizationView transform={transform} />
}
