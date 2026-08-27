import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Icon } from "../icon/Icon";
import "./Toolbar.scss";
import { Shortcut } from "../../resources/shortcut/Shortcut";
import { ShortcutView } from "../shortcut/ShortcutView";
import { Instance } from "../../Instance";
import { ShortcutManager } from "../../resources/shortcut/ShortcutManager";
import { Button } from "../button/Button";
import { UiSize } from "../UiSize";

interface Props {
    tabs: Toolbar.Tab[]
}

export function Toolbar(props: Props) {
    const [path, setPath] = useState<number[]>([]);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log("path", path);
    }, [path]);

    useEffect(() => {
        function onClick(e: globalThis.MouseEvent) {
            if (!ref.current)
                return

            if (ref.current.contains(e.target as Node))
                return

            setPath([]);
        }

        document.addEventListener("click", onClick);

        return () => {
            document.removeEventListener("click", onClick);
        }
    }, [])

    function onSetPath(path: number[]) {
        console.log("onSetPath toolbar", path);
        setPath(path);
    }

    return <div className="Toolbar" ref={ref}>
        {
            props.tabs.map((tab, index) => {
                return <ToolbarTab
                    tab={tab}
                    path={path}
                    index={index}
                    onSetPath={onSetPath}
                />
            })
        }
    </div>
}

function ToolbarTab(props: {
    tab: Toolbar.Tab,
    path: number[],
    index: number,
    onSetPath: (path: number[]) => void
}) {
    const open = props.path[0] === props.index
    const subpath = props.path.slice(1)

    function onSetPath(path: number[]) {
        console.log("onSetPath", props.index, path, [props.index, ...path]);
        props.onSetPath([props.index, ...path]);
    }

    function onClose() {
        console.log("onClose", props.index);
        props.onSetPath([]);
    }

    function onClick(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();

        console.log("onClick", props.index, open);

        if (open)
            props.onSetPath([]);
        else
            props.onSetPath([props.index]);
    }

    return <div
        className="ToolbarTab"
        data-open={open}
    >
        <Button
            size={UiSize.XS}
            onClick={onClick}
        >
            {props.tab.label}
        </Button>
        {
            open && <div className="items">
                {props.tab.items.map((item, index) => {
                    return <ToolbarItem
                        item={item}
                        path={subpath}
                        index={index}
                        onSetPath={onSetPath}
                        onClose={onClose}
                    />
                })}
            </div>
        }
    </div>
}

function ToolbarItem(props: {
    item: Toolbar.Item,
    path: number[],
    index: number,
    onSetPath: (path: number[]) => void,
    onClose: () => void
}) {
    if (props.item.type === "simple") {
        return <ToolbarSimpleItem
            label={props.item.label}
            onClick={props.item.onClick}
            onClose={props.onClose}
        />
    }

    if (props.item.type === "menu") {
        return <ToolbarMenuItem
            label={props.item.label}
            items={props.item.items}
            onClose={props.onClose}
            index={props.index}
            path={props.path}
            onSetPath={props.onSetPath}
        />
    }

    if (props.item.type === "shortcut") {
        return <ToolbarShortcutItem
            label={props.item.label}
            shortcut={props.item.shortcut}
            onClose={props.onClose}
        />
    }

    if (props.item.type === "section") {
        return <ToolbarSectionItem
            label={props.item.label}
            items={props.item.items}
            path={props.path}
            onSetPath={props.onSetPath}
            onClose={props.onClose}
        />
    }

    return null;
}

function ToolbarSimpleItem(props: {
    label: string,
    onClick: () => void,
    onClose: () => void
}) {
    return <Button
        className="ToolbarItem ToolbarSimpleItem"
        size={UiSize.XS}
        onClick={e => {
            e.stopPropagation();
            props.onClick();
            props.onClose();
        }}
    >
        {props.label}
    </Button>
}

function ToolbarShortcutItem(props: {
    label: string,
    shortcut: Shortcut,
    onClose: () => void
}) {
    function onClick(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        Instance.engine.getResource(ShortcutManager).trigger(props.shortcut)
        props.onClose();
    }
    return <Button
        className="ToolbarItem ToolbarShortcutItem"
        size={UiSize.XS}
        onClick={onClick}
    >
        {props.label}
        <ShortcutView
            shortcut={props.shortcut}
        />
    </Button>
}

function ToolbarMenuItem(props: {
    label: string,
    items: Toolbar.Item[],
    index: number,
    path: number[],
    onSetPath: (path: number[]) => void,
    onClose: () => void,
}) {
    const open = props.path[0] === props.index
    const subpath = props.path.slice(1)

    function onSetPath(path: number[]) {
        console.log("onSetPath", path);
        props.onSetPath([props.index, ...path]);
    }

    function onToggle(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();

        if (open)
            props.onSetPath([]);
        else
            props.onSetPath([props.index]);
    }

    return <Button
        className="ToolbarItem ToolbarMenuItem"
        onClick={onToggle}
        size={UiSize.XS}
    >
        {props.label}

        <Icon name="chevron_right" />
        {
            open && <div className="items">
                {props.items.map((item, index) => {
                    return <ToolbarItem
                        item={item}
                        path={subpath}
                        index={index}
                        onSetPath={onSetPath}
                        onClose={props.onClose}
                    />
                })}
            </div>
        }
    </Button>
}

function ToolbarSectionItem(props: {
    label: string,
    items: Toolbar.Item[],
    path: number[],
    onSetPath: (path: number[]) => void,
    onClose: () => void
}) {
    return <div className="ToolbarSectionItem">
        <p>{props.label}</p>

        {props.items.map((item, index) => {
            return <ToolbarItem
                item={item}
                path={props.path}
                index={index}
                onSetPath={props.onSetPath}
                onClose={props.onClose}
            />
        })}
    </div>
}

export namespace Toolbar {

    export interface Tab {
        label: string,
        items: Item[]
    }

    export type Item = SimpleItem | MenuItem | ShortcutItem | SectionItem;

    export type SimpleItem = {
        type: "simple",
        label: string,
        onClick: () => void
    }

    export type MenuItem = {
        type: "menu",
        label: string,
        items: Item[]
    }

    export type ShortcutItem = {
        type: "shortcut",
        label: string,
        shortcut: Shortcut,
    }

    export type SectionItem = {
        type: "section",
        label: string,
        items: Item[]
    }

    export namespace Tab {

        export function create(label: string, items: Item[]): Tab {
            return {
                label,
                items
            }
        }

        export function section(label: string, items: Item[]): Item {
            return {
                type: "section",
                label,
                items
            }
        }

    }

    export namespace Item {

        export function simple(label: string, onClick: () => void): Item {
            return {
                type: "simple",
                label,
                onClick
            }
        }

        export function menu(label: string, items: Item[]): Item {
            return {
                type: "menu",
                label,
                items
            }
        }

        export function shortcut(label: string, shortcut: Shortcut): Item {
            return {
                type: "shortcut",
                label,
                shortcut
            }
        }

        export function section(label: string, items: Item[]): Item {
            return {
                type: "section",
                label,
                items
            }
        }

    }

}