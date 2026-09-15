import { UserQueries } from "../../queries/user/UserQueries";
import { Instance } from "../../Instance";
import { AuthManager } from "../../resources/AuthManager";
import { Button, ButtonTheme } from "../button/Button";
import { Popup } from "../popup/Popup";
import { Spinner } from "../spinner/Spinner";
import "./ProfilePopup.scss";
import { FormInputField } from "../form/FormInputField";
import { useQuery } from "../../hooks/useQuery";

type Props = {
    close: () => void,
}

export function ProfilePopup(props: Props) {
    const { result: user, isLoading } = useQuery(UserQueries.me, { arguments: {} })

    function onLogout() {
        Instance.engine.getResource(AuthManager).logout()
        props.close()
    }

    return <Popup.BaseContainer className="ProfilePopup">
        <Popup.BaseTitle
            title="Profile"
            close={props.close}
        />
        {
            isLoading ?
                <div className="flex justify-center items-center p-5">
                    <Spinner />
                </div> :
                user?.ok ?
                    <div className="grid gap-4">
                        <FormInputField label="Username">
                            <span>{user.value.name}</span>
                        </FormInputField>
                        <FormInputField label="Email">
                            <span>{user.value.email}</span>
                        </FormInputField>

                        <div className="flex justify-end">
                            <Button theme={ButtonTheme.Danger} onClick={onLogout}>
                                Log out
                            </Button>
                        </div>
                    </div> :
                    <p>Unable to load profile.</p>
        }
    </Popup.BaseContainer>
}
