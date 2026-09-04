import type { LevelEntity } from "../../queries/level/LevelEntity";
import { Form } from "../form/Form";
import { Popup } from "../popup/Popup";
import { useForm } from "../../hooks/useForm";
import { FormSchema } from "../../form/FormSchema";
import { Button, ButtonTheme } from "../button/Button";
import { Spinner } from "../spinner/Spinner";
import { LevelQueries } from "../../queries/level/LevelQueries";
import { useToastManager } from "../../hooks/useToastManager";
import { Toast } from "../toast/Toast";

interface Props {
    close: () => void,
    level: LevelEntity,
    onSuccess: () => void
}

const schema = new FormSchema({})

export function DeleteLevelPopup(props: Props) {
    const formHandler = useForm(schema)
    const toastManager = useToastManager()

    async function onSubmit() {
        const result = await LevelQueries.remove(props.level.id)
        if (result.ok) {
            props.onSuccess()
            props.close()
            return;
        }

        // TODO: handle error
        toastManager.add(close => <Toast.Simple
            close={close}
            message={"Could not delete level (" + result.error.message + ")"}
        />)
    }

    return <Popup.BaseContainer>
        <Popup.BaseTitle
            title="Delete Level"
            close={props.close}
        />
        <Form
            handler={formHandler}
            onSubmit={onSubmit}
            className="gap-4"
        >
            <p>Are you sure you want to delete this level?</p>
            <div className="flex items-end gap-2">
                <Button theme={ButtonTheme.Default} onClick={props.close}>
                    Cancel
                </Button>
                <Button
                    theme={ButtonTheme.Danger}
                    type="submit"
                    disabled={formHandler.loading}
                >
                    {formHandler.loading ? <Spinner /> : 'Delete'}
                </Button>
            </div>
        </Form>
    </Popup.BaseContainer>
}