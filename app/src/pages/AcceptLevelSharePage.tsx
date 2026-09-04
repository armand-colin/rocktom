import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button, ButtonTheme } from "../ui/button/Button";
import { LevelQueries } from "../queries/level/LevelQueries";
import { useToastManager } from "../hooks/useToastManager";
import { Toast } from "../ui/toast/Toast";
import { Popup } from "../ui/popup/Popup";

export function AcceptLevelSharePage() {
    const { token } = useParams()
    const toastManager = useToastManager()

    const navigate = useNavigate()

    if (!token) {
        return <Navigate to="/app" replace />
    }

    function onDecline() {
        navigate('/app')
    }

    async function onAccept() {
        const result = await LevelQueries.acceptShare(token!)
        if (result.ok) {
            navigate('/app')
        } else {
            toastManager.add(close => <Toast.Simple
                message={"Failed to accept level share: " + (result.error?.message ?? "unknown")}
                close={close}
            />)
        }
    }

    return <div className="flex justify-center items-center h-[100svh] w-[100svw]">
        <Popup.BaseContainer className="w-[100vw] max-w-100">
            <p>Accept level share?</p>

            <div className="flex gap-2">
                <Button
                    onClick={onAccept}
                    theme={ButtonTheme.Primary}
                >
                    Accept
                </Button>
                <Button onClick={onDecline}>
                    Decline
                </Button>
            </div>
        </Popup.BaseContainer>
    </div>
}
