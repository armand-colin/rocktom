import { useEffect, useMemo, useState } from "react"
import { useMutation } from "../../../hooks/useMutation"
import { LevelEntity } from "../../../queries/level/LevelEntity"
import { LevelQueries } from "../../../queries/level/LevelQueries"
import { Button, ButtonTheme } from "../../button/Button"
import { Icon } from "../../icon/Icon"
import { Popup } from "../../popup/Popup"
import { Toggle } from "../../toggle/Toggle"
import { FormInputField } from "../../form/FormInputField"
import { StringInput } from "../../input/StringInput"
import { Toast } from "../../toast/Toast"
import { useToastManager } from "../../../hooks/useToastManager"

type Props = {
    close: () => void,
    level: LevelEntity,
    share: LevelEntity.Share,
}

export function LevelSharePopup(props: Props) {
    const { mutate: updateShare, isLoading: isUpdatePending } = useMutation(LevelQueries.updateShare)
    const toastManager = useToastManager()

    const [permission, setPermission] = useState<LevelEntity.SharePermission>(props.share.permission)
    const [enabled, setEnabled] = useState<boolean>(props.share.enabled)
    const [copied, setCopied] = useState<boolean>(false)

    const shareLink = useMemo(() => {
        const token = props.share.token
        if (!token) {
            return ""
        }

        return `${window.location.origin}/app/share/${token}`
    }, [props.share.token])

    useEffect(() => {
        if (!copied) {
            return;
        }

        const timeout = setTimeout(() => {
            setCopied(false)
        }, 5000, undefined)

        return () => {
            clearTimeout(timeout)
        }
    }, [copied])

    function onCopyLink() {
        setCopied(false)

        navigator.clipboard.writeText(shareLink)
            .then(() => {
                toastManager.add(close => <Toast.Simple
                    message="Link copied to clipboard"
                    close={close}
                />)
                setCopied(true)
            })
            .catch(() => {
                toastManager.add(close => <Toast.Simple
                    message="Failed to copy link to clipboard"
                    close={close}
                />)
            })
    }

    function onEnableSharingChange(value: boolean) {
        updateShare(props.level.id, {
            enabled: value,
            permission: props.share.permission,
        })
            .then(() => {
                // TODO: store value in level storage
                setEnabled(value)
                toastManager.add(close => <Toast.Simple
                    message="Sharing updated"
                    close={close}
                />)
            })
            .catch(_e => {
                toastManager.add(close => <Toast.Simple
                    message="Failed to update sharing"
                    close={close}
                />)
            })
    }

    function onPermissionChange(value: LevelEntity.SharePermission) {
        updateShare(props.level.id, {
            enabled: enabled,
            permission: value,
        })
            .then(() => {
                // TODO: store value in level storage
                setPermission(value)
                toastManager.add(close => <Toast.Simple
                    message="Sharing updated"
                    close={close}
                />)
            })
            .catch(_e => {
                toastManager.add(close => <Toast.Simple
                    message="Failed to update sharing"
                    close={close}
                />)
            })
    }

    return <Popup.BaseContainer
        className="max-w-100 w-[100svw]"
    >
        <Popup.BaseTitle
            title="Level sharing"
            close={props.close}
        />

        <div className="grid gap-4">
            <FormInputField label="Share link">
                <div className="flex gap-2">
                    <StringInput
                        value={shareLink}
                        className="flex-1"
                    />
                    <Button
                        onClick={onCopyLink}
                        shape="square"
                        theme={copied ? ButtonTheme.Primary : ButtonTheme.Default}
                    >
                        <Icon name={copied ? "check" : "content_copy"} />
                    </Button>
                </div>
            </FormInputField>

            <FormInputField
                label="Share permission"
                disabled={isUpdatePending}
            >
                <div className="flex gap-2">
                    <Button
                        theme={permission === "write" ? ButtonTheme.Primary : ButtonTheme.Default}
                        onClick={() => onPermissionChange(LevelEntity.SharePermission.Write)}
                    >
                        Write
                    </Button>
                    <Button
                        theme={permission === "read" ? ButtonTheme.Primary : ButtonTheme.Default}
                        onClick={() => onPermissionChange(LevelEntity.SharePermission.Read)}
                    >
                        Read
                    </Button>
                </div>
            </FormInputField>

            <FormInputField
                label="Enable sharing"
                disabled={isUpdatePending}
            >
                <Toggle
                    value={enabled}
                    onChange={onEnableSharingChange}
                />
            </FormInputField>
        </div>
    </Popup.BaseContainer>
}