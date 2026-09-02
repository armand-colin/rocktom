import { Instrument } from "../../sound/instrument/Instrument"
import { Dropdown } from "../dropdown/Dropdown"

type InstrumentOption = Dropdown.Option & {
    instrument: Instrument
}

function instrumentOption(instrument: Instrument): InstrumentOption {
    return {
        value: instrument.id,
        label: instrument.name,
        instrument: instrument
    }
}

const instrumentOptions = [
    instrumentOption(Instrument.BassStandard),
    instrumentOption(Instrument.BassDropD),
    instrumentOption(Instrument.GuitarStandard),
    instrumentOption(Instrument.GuitarDropD)
]

export function InstrumentDropdown(props: {
    value: Instrument,
    onChange: (instrument: Instrument) => void
}) {
    function onChange(option: InstrumentOption | null) {
        if (!option)
            return

        props.onChange(option.instrument)
    }

    return <Dropdown
        value={props.value.id}
        onChange={onChange}
        options={instrumentOptions}
    />
}