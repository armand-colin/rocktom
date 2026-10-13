import { InstrumentType } from "../../sound/instrument/Instrument"
import { Pill } from "../pill/Pill"
import { cn } from "../utils/cn"
import "./LevelInstrumentsView.scss"

export function LevelInstrumentsView(props: {
    instrumentTypes: InstrumentType[],
    className?: string
}) {
    return <span className={cn("LevelInstrumentsView", props.className)}>
        {
            props.instrumentTypes.map(type => <Pill
                theme={
                    type === InstrumentType.Bass ?
                        "primary" :
                        "warning"
                }
                key={type}
                label={InstrumentType.getLabel(type)}
            />)
        }
    </span>
}