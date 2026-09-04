import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button, ButtonTheme } from "../ui/button/Button";
import { LevelQueries } from "../queries/level/LevelQueries";
import { useToastManager } from "../hooks/useToastManager";
import { Toast } from "../ui/toast/Toast";
import { Popup } from "../ui/popup/Popup";
import { useMutation } from "../hooks/useMutation";
import { useEffect } from "react";
import { Spinner } from "../ui/spinner/Spinner";
import { FetchErrorView } from "../ui/fetchError/FetchErrorView";
import type { LevelEntity } from "../queries/level/LevelEntity";
import { StatusCode } from "../resources/fetch/StatusCode";
import { LevelInstrumentsView } from "../ui/level/LevelInstrumentsView";
import { InstrumentType } from "../sound/instrument/Instrument";
import { FormSchema } from "../form/FormSchema";
import { useForm } from "../hooks/useForm";
import { Form } from "../ui/form/Form";

export function AcceptLevelSharePage() {
    const { token } = useParams()

    if (!token) {
        return <Navigate to="/app" replace />
    }

    return <div className="flex justify-center items-center h-svh w-svw">
        <WithToken token={token} />
    </div>
}

function WithToken(props: { token: string }) {
    const { mutate: getSharePreview, isLoading, data } = useMutation(LevelQueries.getSharePreview)

    useEffect(() => {
        getSharePreview(props.token)
    }, [props.token])

    return <Popup.BaseContainer className="w-full max-w-100">
        {
            (isLoading || !data) ?
                <div className="flex justify-center items-center w-full h-50">
                    <Spinner />
                </div> :
                data.ok ?
                    <WithPreview
                        token={props.token}
                        preview={data.value}
                    /> :
                    <FetchErrorView
                        error={data.error}
                        statusCodes={{
                            [StatusCode.NotFound]: () => <p>Share not found</p>,
                        }}
                        default={() => <p>An error has occured</p>}
                    />
        }
    </Popup.BaseContainer>
}

const schema = FormSchema.default()

function WithPreview(props: { token: string, preview: LevelEntity.SharePreview }) {
    const toastManager = useToastManager()
    const navigate = useNavigate()
    const handler = useForm(schema)

    async function onAccept() {
        const result = await LevelQueries.acceptShare(props.token)

        if (result.ok) {
            navigate('/app')
        } else {
            toastManager.add(close => <Toast.Simple
                message={"Failed to accept level share: " + (result.error.message)}
                close={close}
            />)
        }
    }

    function onDecline() {
        navigate('/app')
    }

    return <Form
        handler={handler}
        onSubmit={onAccept}
        className="grid gap-5"
    >
        <p>Accept level share?</p>

        <LevelPreview preview={props.preview} />

        <div className="flex gap-2 justify-end mt-2">
            <Button onClick={onDecline}>
                Decline
            </Button>
            <Button
                onClick={onAccept}
                theme={ButtonTheme.Primary}
            >
                Accept
            </Button>
        </div>
    </Form>
}

function formatSeconds(seconds: number) {
    const minutes = (seconds / 60) | 0
    const secs = (seconds % 60) | 0
    return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function LevelPreview(props: { preview: LevelEntity.SharePreview }) {
    return <div className="py-4 px-5 rounded-md bg-grey-500 grid gap-1">
        <p>
            {props.preview.name}
            <LevelInstrumentsView
                instrumentTypes={props.preview.instrumentTypes.filter(InstrumentType.is)}
                className="ml-2 align-middle"
            />
        </p>

        <div className="text-body-sm text-grey-200">
            <p>Duration : {formatSeconds(props.preview.duration)}</p>
            <p>by <i>{props.preview.user.name}</i></p>
        </div>
    </div>
}