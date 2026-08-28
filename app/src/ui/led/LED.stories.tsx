import { Button } from "../button/Button";
import { LED } from "./LED";

export default {
    title: "LED",
    component: LED,
}

export const Default = () => {

    return <div className="flex items-center gap-2">
        <LED theme="default" />
        <LED theme="error" />
        <LED theme="primary" />

        <Button className="items-center">
            <LED theme="default" />
            Super LED button
        </Button>
    </div>

}