import { useComponent, useResource } from "@niloc/ecs-react";
import { Popup } from "../popup/Popup";
import { State } from "../../resources/State";
import { Button } from "../button/Button";
import { MediaStreamList } from "../../resources/MediaStreamList";
import { Dropdown } from "../dropdown/Dropdown";
import { LiveInstrument } from "../../components/LiveInstrument";
import { Instance } from "../../Instance";
import { LiveInstrumentPreferences } from "../../resources/LiveInstrumentPreferences";
import { SoundEngine } from "../../resources/SoundEngine";
import { Icon } from "../icon/Icon";
import { useEffect } from "react";
import { useComponentInstance } from "../../hooks/useComponentInstance";
import { Tuner } from "../../components/Tuner";
import { TunerView } from "./TunerView";
import { MixerChannelView } from "../mixerView/MixerChannelView";
import { Mixer } from "../../resources/Mixer";
import { InstrumentDropdown } from "../instrumentDropdown/InstrumentDropdown";
import { FormInputField } from "../form/FormInputField";

type Props = {
    close: () => void
}

export function LiveInstrumentPopup(props: Props) {
    const { instrument } = useResource(State)
    const engine = Instance.engine
    const mixer = engine.getResource(Mixer)

    return <Popup.BaseContainer className="w-100">
        <Popup.BaseTitle
            title="Live Instrument"
            close={props.close}
        />

        <MediaStreamDropdown
            instrument={instrument}
        />

        <FormInputField label="Feedback">
            <MixerChannelView
                channel={mixer.feedback}
                hideLabel
            />
        </FormInputField>

        {
            instrument ?
                <LiveInstrumentPreview
                    instrument={instrument}
                /> :
                null
        }
    </Popup.BaseContainer>
}

function MediaStreamDropdown(props: { instrument: LiveInstrument | null }) {
    const mediaStreamList = useResource(MediaStreamList)
    const { loading } = mediaStreamList

    function onRefresh() {
        mediaStreamList.refresh()
    }

    useEffect(() => {
        mediaStreamList.refresh()
    }, [])

    async function setInstrument(option: Dropdown.Option | null) {
        const state = Instance.engine.getResource(State)
        const preferences = Instance.engine.getResource(LiveInstrumentPreferences)

        if (!option) {
            state.setInstrument(null)
            return;
        }

        preferences.deviceId = option.value
        const stream = await preferences.getMediaStream()

        const liveInstrument = Instance.engine.createComponent(LiveInstrument, {
            stream,
            streamId: option.value,
            name: option.label
        })

        Instance.engine.getResource(SoundEngine).resume()
        state.setInstrument(liveInstrument)
    }

    return <div className="flex gap-2">
        <Dropdown
            options={mediaStreamList.streams.map<Dropdown.Option>(stream => ({
                label: stream.label,
                value: stream.deviceId,
            }))}
            value={props.instrument?.streamId ?? null}
            onChange={setInstrument}
            placeholder={loading ? "Loading..." : "Select a microphone"}
            className="flex-1"
        />
        {
            props.instrument && <Button
                shape="square"
                onClick={() => setInstrument(null)}
            >
                <Icon name="close" />
            </Button>
        }
        <Button
            onClick={onRefresh}
            shape="square"
        >
            <Icon name="refresh" />
        </Button>
    </div>
}

function LiveInstrumentPreview(props: { instrument: LiveInstrument }) {
    const tuner = useComponentInstance(Tuner, props.instrument)
    const { instrument } = useComponent(props.instrument)

    return <div className="grid gap-5">
        <div className="grid gap-2">
            <h2>Instrument</h2>
            <InstrumentDropdown
                value={instrument}
                onChange={instrument => {
                    props.instrument.setInstrument(instrument)
                }}
            />
        </div>
        
        <div className="grid gap-2">
            <h2>Tuner</h2>
            {
                tuner ?
                    <TunerView
                        tuner={tuner}
                        instrument={props.instrument.instrument}
                    /> :
                    null
            }
        </div>
    </div>
}