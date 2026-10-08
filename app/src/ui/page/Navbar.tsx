import { Link, useLocation } from "react-router-dom";
import "./Navbar.scss"
import { Icon, type IconName } from "../icon/Icon";
import { cn } from "../utils/cn";
import { Routes } from "../../Routes";

export function Navbar() {

    const pathname = useLocation().pathname

    return <nav className="Navbar">
        <NavbarItem
            label="Levels"
            currentPathname={pathname}
            icon="home"
            path={Routes.Home.compile({})}
        />
        <NavbarItem
            label="Settings"
            currentPathname={pathname}
            icon="settings"
            path={Routes.Settings.compile({})}
        />
    </nav>

}

function NavbarItem(props: {
    label: string,
    currentPathname: string,
    icon: IconName,
    path: string,
}) {
    return <Link
        to={props.path}
        className={cn("NavbarItem")}
        data-active={props.currentPathname === props.path}
    >
        <Icon
            name={props.icon}
        />
        <span>{props.label}</span>
    </Link>
}