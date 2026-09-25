import { useContext } from "react";
import { Button } from "./Button";
import { FormContext } from "../form/FormContext";
import { Spinner } from "../spinner/Spinner";
import './SubmitButton.scss'
import { cn } from "../utils/cn";

export function SubmitButton(props: {
    label: string,
    className?: string,
}) {
    const { loading } = useContext(FormContext)

    return <Button
        className={cn("SubmitButton", props.className)}
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