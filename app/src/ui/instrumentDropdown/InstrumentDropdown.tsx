import { Instrument } from "../../sound/instrument/Instrument"
import { Dropdown } from "../dropdown/Dropdown"
import type { UiSize } from "../UiSize"

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

export function InstrumentDropdown<I extends Instrument | null>(props: {
    value: I,
    onChange: (instrument: I) => void,
    className?: string,
    size?: UiSize
}) {
    function onChange(option: InstrumentOption | null) {
        if (!option)
            return

        props.onChange(option.instrument as I)
    }

    return <Dropdown
        value={props.value?.id ?? null}
        onChange={onChange}
        options={instrumentOptions}
        placeholder="Select an instrument"
        className={props.className}
        size={props.size}
    />
}