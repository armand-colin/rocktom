import { useResource } from "@niloc/ecs-react";
import { Button } from "../button/Button";
import { AuthStore } from "../../resources/AuthStore";
import { Instance } from "../../Instance";
import { AuthManager } from "../../resources/AuthManager";

export function ProfileButton() {
    const { session } =useResource(AuthStore)

    return <Button onClick={( )=> {
        Instance.engine.getResource(AuthManager).logout()
    }}>
        {session?.userId}
        Log out
    </Button>
}