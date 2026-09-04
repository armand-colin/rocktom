import { InstrumentType } from "../../sound/instrument/Instrument"
import { cn } from "../utils/cn"
import "./LevelInstrumentsView.scss"

export function LevelInstrumentsView(props: { 
    instrumentTypes: InstrumentType[], 
    className?: string 
}) {
    return <span className={cn("LevelInstrumentsView", props.className)}>
        {
            props.instrumentTypes.map(type => <span
                key={type}
                data-type={type}
            >
                {InstrumentType.getLabel(type)}
            </span>)
        }
    </span>
}