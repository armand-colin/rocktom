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

export function SettingsView() {
    const appUpdateManager = useResource(AppUpdateManager)
    const globalPreferences = useResource(GlobalPreferences)
    const liveInstrumentPreferences = useResource(LiveInstrumentPreferences)

    useEffect(() => {
        void appUpdateManager.check()
    }, [appUpdateManager])

    return <div className="SettingsView">
        <FormInputField label="App version">
            <div className="flex flex-col gap-3 items-start">
                {
                    appUpdateManager.needsRefresh ?
                        <Button
                            onClick={() => appUpdateManager.applyUpdate()}
                            theme="primary"
                        >
                            Update
                        </Button> :
                        <>
                            <p>You're up to date</p>
                            <Button
                                disabled={appUpdateManager.checking}
                                onClick={() => appUpdateManager.check()}
                            >
                                {
                                    appUpdateManager.checking ?
                                        "Checking..." :
                                        "Check for updates"
                                }
                            </Button>
                        </>
                }
            </div>
        </FormInputField>

        <FormInputField label="Preferred Visualization">
            <div className="mode">
                <Button
                    theme={globalPreferences.visualMode === PlaybackVisualMode.ThreeD ? ButtonTheme.Primary : ButtonTheme.Default}
                    onClick={() => { globalPreferences.visualMode = PlaybackVisualMode.ThreeD }}
                    className="flex-1 max-w-30"
                >
                    3D
                </Button>
                <Button
                    theme={globalPreferences.visualMode === PlaybackVisualMode.Tab ? ButtonTheme.Primary : ButtonTheme.Default}
                    onClick={() => { globalPreferences.visualMode = PlaybackVisualMode.Tab }}
                    className="flex-1 max-w-30"
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
