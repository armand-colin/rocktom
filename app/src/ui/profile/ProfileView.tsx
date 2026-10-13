import { useQuery } from "../../hooks/useQuery"
import { Instance } from "../../Instance"
import { UserQueries } from "../../queries/user/UserQueries"
import { AuthManager } from "../../resources/AuthManager"
import { Button, ButtonTheme } from "../button/Button"
import { FormInputField } from "../form/FormInputField"
import { Spinner } from "../spinner/Spinner"

export function ProfileView(props: { onLoggedOut?: () => void }) {
    const { result: user, isLoading } = useQuery(UserQueries.me, { arguments: {} })

    function onLogout() {
        Instance.engine.getResource(AuthManager).logout()
        props.onLoggedOut?.()
    }

    return <div className="ProfileView">
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

                        <div className="flex justify-start">
                            <Button theme={ButtonTheme.Danger} onClick={onLogout}>
                                Log out
                            </Button>
                        </div>
                    </div> :
                    <p>Unable to load profile.</p>
        }
    </div>
}
