import { useResource } from "@niloc/ecs-react";
import { AppUpdateManager } from "../../resources/AppUpdateManager";
import { GlobalPreferences } from "../../resources/GlobalPreferences";
import { LiveInstrumentPreferences } from "../../resources/LiveInstrumentPreferences";
import { PlaybackVisualMode } from "../../playback/PlaybackVisualMode";
import { Button, ButtonTheme } from "../button/Button";
import { FormInputField } from "../form/FormInputField";
import { InstrumentDropdown } from "../instrumentDropdown/InstrumentDropdown";
import { MixerView } from "../mixerView/MixerView";
import "./SettingsView.scss";
import { useEffect } from "react";
import { Spinner } from "../spinner/Spinner";

const APP_VERSION = "0.0.0"

export function SettingsView() {
    const appUpdateManager = useResource(AppUpdateManager)
    const globalPreferences = useResource(GlobalPreferences)
    const liveInstrumentPreferences = useResource(LiveInstrumentPreferences)

    useEffect(() => {
        void appUpdateManager.check()
    }, [appUpdateManager])

    return <div className="SettingsView">
        <FormInputField label="Version">
            <span>{APP_VERSION}</span>
        </FormInputField>

        {
            appUpdateManager.needsRefresh ?
                <div className="update">
                    <p>A new version is available.</p>
                    <Button
                        theme={ButtonTheme.Primary}
                        onClick={() => appUpdateManager.applyUpdate()}
                    >
                        Update
                    </Button>
                </div> :
                appUpdateManager.checking ?
                    <Spinner /> :
                    <p className="upToDate">
                        You're up to date
                        <Button onClick={() => appUpdateManager.check()}>Check for updates</Button>
                    </p>
        }

        <FormInputField label="Visualization">
            <div className="mode">
                <Button
                    theme={globalPreferences.visualMode === PlaybackVisualMode.ThreeD ? ButtonTheme.Primary : ButtonTheme.Default}
                    onClick={() => { globalPreferences.visualMode = PlaybackVisualMode.ThreeD }}
                >
                    3D
                </Button>
                <Button
                    theme={globalPreferences.visualMode === PlaybackVisualMode.Tab ? ButtonTheme.Primary : ButtonTheme.Default}
                    onClick={() => { globalPreferences.visualMode = PlaybackVisualMode.Tab }}
                >
                    Tab
                </Button>
            </div>
        </FormInputField>

        <FormInputField label="Instrument">
            <InstrumentDropdown
                value={liveInstrumentPreferences.instrument}
                onChange={instrument => {
                    liveInstrumentPreferences.instrument = instrument
                }}
            />
        </FormInputField>

        <section className="mix">
            <h2>Mix</h2>
            <MixerView />
        </section>
    </div>
}
