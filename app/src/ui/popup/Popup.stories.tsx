import { usePopupManager } from "../../hooks/usePopupManager"
import { Button } from "../button/Button"
import { Popup } from "./Popup"

export default {
    title: "Popup"
}

const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

export const Default = () => {
    const popupManager = usePopupManager()

    function onPop(size: number) {
        popupManager.add(close => <Popup.BaseContainer className="w-full max-x-300">
            <Popup.BaseTitle title="My popup" close={close} />
            <Popup.BaseContent>
                {
                    new Array(size).fill(null).map((_, index) => (
                        <p key={index}>{lorem}</p>
                    ))
                }
            </Popup.BaseContent>
            <Popup.BaseButtons>
                <Button onClick={close}>Close</Button>
                <Button theme="primary">Primary action</Button>
            </Popup.BaseButtons>
        </Popup.BaseContainer>)
    }

    return <div>
        <div className="flex gap-2">
            <Button onClick={() => onPop(10)}>Pop</Button>
            <Button onClick={() => onPop(1)}>Pop small</Button>
        </div>
    </div>
}