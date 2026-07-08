import { useEffect } from "react";
import { useMutation } from "../../hooks/useMutation";
import { UserQueries } from "../../queries/user/UserQueries";
import { Instance } from "../../Instance";
import { AuthManager } from "../../resources/AuthManager";
import { Button, ButtonTheme } from "../button/Button";
import { Popup } from "../popup/Popup";
import { Spinner } from "../spinner/Spinner";
import "./ProfilePopup.scss";

type Props = {
    close: () => void,
}

export function ProfilePopup(props: Props) {
    const { data: user, mutate: getUser, isLoading } = useMutation(UserQueries.me)

    useEffect(() => {
        getUser()
    }, [])

    function onLogout() {
        Instance.engine.getResource(AuthManager).logout()
        props.close()
    }

    return <Popup.BaseContainer className="ProfilePopup">
        <Popup.BaseTitle title="Profile" close={props.close} />
        {
            isLoading ?
                <Spinner /> :
                user?.ok ?
                    <div className="content">
                        <div className="field">
                            <span className="label">Username</span>
                            <span className="value">{user.value.name}</span>
                        </div>
                        <div className="field">
                            <span className="label">Email</span>
                            <span className="value">{user.value.email}</span>
                        </div>
                        <div className="actions">
                            <Button theme={ButtonTheme.Danger} onClick={onLogout}>
                                Log out
                            </Button>
                        </div>
                    </div> :
                    <p>Unable to load profile.</p>
        }
    </Popup.BaseContainer>
}
