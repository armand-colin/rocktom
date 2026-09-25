import { useContext } from "react";
import { Button } from "./Button";
import { FormContext } from "../form/FormContext";
import { Spinner } from "../spinner/Spinner";
import './SubmitButton.scss'

export function SubmitButton(props: {
    label: string,
}) {
    const { loading } = useContext(FormContext)

    return <Button
        className="SubmitButton"
        type="submit"
        theme="primary"
        data={{
            loading,
        }}
    >
        <span>{props.label}</span>

        {loading && <div>
            <Spinner />
        </div>}
    </Button>
}