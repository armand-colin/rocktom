import { useToastManager } from "../../hooks/useToastManager"
import { Button } from "../button/Button"
import { Toast } from "./Toast"

export default {
    title: "UI/Toast",
}

export const Default = () => {
    const toastManager = useToastManager()

    return <div className="flex gap-2">
        <Button onClick={() => toastManager.add(close => <Toast.Simple
            message="Level saved successfully"
            close={close}
        />)}>
            Simple
        </Button>

        <Button onClick={() => toastManager.add(close => <Toast.Simple
            message="Level imported successfully"
            icon="check"
            close={close}
        />)}>
            With icon
        </Button>

        <Button onClick={() => toastManager.add(close => <Toast.Simple
            message="A new version is available."
            close={close}
            action={{
                label: "Update",
                onClick: close,
            }}
        />)}>
            With action
        </Button>
    </div>
}
