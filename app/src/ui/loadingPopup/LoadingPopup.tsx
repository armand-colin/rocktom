import { Popup } from "../popup/Popup";
import { Spinner } from "../spinner/Spinner";

export function LoadingPopup() {

    return <Popup.BaseContainer>
        <div className="h-100 w-100 flex justify-center items-center">
            <Spinner />
        </div>
    </Popup.BaseContainer>

}