import type { ReactNode } from "react"

interface Props<T extends Option> {
    options: T[],
    value: T | null,
    onChange: (value: T) => void,
    content?: (props: ContentProps) => ReactNode,
    trigger?: (props: TriggerProps<T>) => ReactNode,
    item?: (props: ItemProps<T>) => ReactNode,
}

interface Option {
    label: string,
    value: string
}

interface ContentProps {
    children?: ReactNode
}

interface TriggerProps<T extends Option> {
    value: T | null
}

interface ItemProps<T extends Option> {
    value: T
}

export function Dropdown<T extends Option>(props: Props<T>) {
    const Content = props.content ?? Dropdown.Content
    const Trigger = props.trigger ?? Dropdown.Trigger
    const Item = props.item ?? Dropdown.Item

    return <div className="Dropdown">
        <div className="trigger">
            <Trigger value={props.value} />
        </div>
        <div className="content">
            <Content>
                {props.options.map(option => (
                    <Item
                        value={option}
                        key={option.value}
                    />
                ))}
            </Content>
        </div>
    </div>
}

export namespace Dropdown {
    export function Content(props: { children?: ReactNode }) {
        return <div>
            {props.children}
        </div>
    }

    export function Trigger<T extends Option>(props: TriggerProps<T>) {
        return <div>
            {props.value?.label}
        </div>
    }

    export function Item<T extends Option>(props: ItemProps<T>) {
        return <div>
            {props.value.label}
        </div>
    }
}