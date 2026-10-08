import { Link, useLocation } from "react-router-dom";
import "./Navbar.scss"
import { Icon, type IconName } from "../icon/Icon";
import { cn } from "../utils/cn";

export function Navbar() {

    const pathname = useLocation().pathname

    return <nav className="Navbar">
        <NavbarItem
            label="Levels"
            currentPathname={pathname}
            icon="home"
            pathname="/app"
        />
        <NavbarItem
            label="Settings"
            currentPathname={pathname}
            icon="settings"
            pathname="/app/settings"
        />
        <NavbarItem
            label="Profile"
            currentPathname={pathname}
            icon="person"
            pathname="/app/profile"
        />
    </nav>

}

function NavbarItem(props: {
    label: string,
    currentPathname: string,
    icon: IconName,
    pathname: string,
}) {
    return <Link
        to={props.pathname}
        className={cn("NavbarItem")}
        data-active={props.currentPathname.startsWith(props.pathname)}
    >
        <Icon
            name={props.icon}
        />
        <span>{props.label}</span>
    </Link>
}