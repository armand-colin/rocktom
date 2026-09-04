import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button, ButtonTheme } from "../ui/button/Button";
import { LevelQueries } from "../queries/level/LevelQueries";
import { useToastManager } from "../hooks/useToastManager";
import { Toast } from "../ui/toast/Toast";
import { Popup } from "../ui/popup/Popup";
import { useMutation } from "../hooks/useMutation";
import { useEffect } from "react";
import { Spinner } from "../ui/spinner/Spinner";

export function AcceptLevelSharePage() {
    const { token } = useParams()


    if (!token) {
        return <Navigate to="/app" replace />
    }

    return <div className="flex justify-center items-center h-svh w-svw">
        <Inner token={token} />
    </div>
}

function Inner(props: { token: string }) {
    const { mutate: getSharePreview, isLoading, data } = useMutation(LevelQueries.getSharePreview)
    const navigate = useNavigate()
    const toastManager = useToastManager()

    useEffect(() => {
        getSharePreview(props.token)
    }, [props.token])

    function onDecline() {
        navigate('/app')
    }

    async function onAccept() {
        const result = await LevelQueries.acceptShare(props.token)
        if (result.ok) {
            navigate('/app')
        } else {
            toastManager.add(close => <Toast.Simple
                message={"Failed to accept level share: " + (result.error?.message ?? "unknown")}
                close={close}
            />)
        }
    }

    return <Popup.BaseContainer className="w-full max-w-100">
        {
            isLoading ?
                <Spinner /> : <>
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
                </>
        }
    </Popup.BaseContainer>
}