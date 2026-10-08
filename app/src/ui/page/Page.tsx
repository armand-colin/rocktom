import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import "./Page.scss";
import { ProfileButton } from "../profile/ProfileButton";
import { SettingsButton } from "../settings/SettingsButton";
import { useLocation, useNavigate } from "react-router-dom";
import { Routes } from "../../Routes";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";

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
        const path = useLocation().pathname
        const isHome = path === Routes.Home.compile({})
        const navigate = useNavigate()

        function onBack() {
            navigate(-1)
        }

        return <header className="PageConnectedTitle">
            <div>
                <h1>
                    {
                        !isHome && <Button
                            shape="square"
                            onClick={onBack}
                            variant="ghost"
                        >
                            <Icon
                                name="arrow_back"
                            />
                        </Button>
                    }
                    {props.title}
                </h1>
                <div>
                    {props.beforeActions}
                    <SettingsButton />
                    <ProfileButton />
                </div>
            </div>
        </header>
    }

    export function Body(props: { children?: ReactNode, containerClassName?: string }) {
        return <main className="PageContent">
            <div className={props.containerClassName}>
                {props.children}
            </div>
        </main>
    }

    export function Footer(props: { children?: ReactNode }) {
        return <footer className="PageFooter">
            {props.children}
        </footer>
    }

}