import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import "./Page.scss";
import { ProfileButton } from "../profile/ProfileButton";

export function Page(props: { children?: ReactNode, className?: string }) {
    return <div className={cn("Page", props.className)}>
        {props.children}
    </div>
}

export namespace Page {

    export function ConnectedTitle(props: {
        title: string,
        beforeActions?: ReactNode
    }) {
        return <header className="PageConnectedTitle">
            <div>
                <h1>Levels</h1>
                <div>
                    {props.beforeActions}
                    <ProfileButton />
                </div>
            </div>
        </header>
    }

    export function Content(props: { children?: ReactNode, containerClassName?: string }) {
        return <main className="PageContent">
            <div className={props.containerClassName}>
                {props.children}
            </div>
        </main>
    }

}