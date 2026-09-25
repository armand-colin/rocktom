import type { LevelEntity } from "../../queries/level/LevelEntity";
import { LevelQueries } from "../../queries/level/LevelQueries";
import { Body } from "../../resources/queryClient/Body";
import { InstrumentType } from "../../sound/instrument/Instrument";
import { PromptPopup } from "../popup/promptPopup/PromptPopup";

type Props = {
    onSuccess: (level: LevelEntity) => void,
    close: () => void,
}

export function CreateLevelPopup(props: Props) {
    async function onSubmit(name: string) {
        const result = await LevelQueries.create.run({
            body: Body.json({
                name: name,
                instrumentTypes: [InstrumentType.Bass],
            }),
        })

        if (result.ok) {
            props.onSuccess(result.value)
            props.close()
        } else {
            console.error(result.error)
        }
    }

    return <PromptPopup
        close={props.close}
        title="Create Level"
        onConfirm={onSubmit}
        confirmLabel="Create"
        placeholder="Level Name"
    />
}