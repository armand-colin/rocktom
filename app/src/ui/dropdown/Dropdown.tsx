import { useState, type ReactNode } from "react"
import "./Dropdown.scss"
import { Icon } from "../icon/Icon"
import { UiSize } from "../UiSize"

interface Props<T extends Dropdown.Option> {
    options: T[],
    value: T | null,
    onChange: (value: T | null) => void,
    content?: (props: Dropdown.ContentProps<T>) => ReactNode,
    trigger?: (props: Dropdown.TriggerProps<T>) => ReactNode,
    item?: (props: Dropdown.ItemProps<T>) => ReactNode,
    className?: string
    size?: UiSize
}

export function Dropdown<T extends Dropdown.Option>(props: Props<T>) {
    const [isOpen, setIsOpen] = useState(false)

    const Content = props.content ?? BaseContent
    const Trigger = props.trigger ?? BaseTrigger
    const Item = props.item ?? BaseItem

    return <div
        className={`Dropdown ${props.className ?? ""}`}
        data-size={props.size ?? UiSize.M}
    >
        <Trigger
            value={props.value}
            isOpen={isOpen}
            onToggleOpen={() => setIsOpen(!isOpen)}
        />
        <Content
            isOpen={isOpen}
            item={Item}
            options={props.options}
            onSelect={value => props.onChange(value)}
            onToggleOpen={(isOpen) => setIsOpen(isOpen ?? !isOpen)}
            selected={props.value?.value ?? null}
        />
    </div>
}

function BaseTrigger<T extends Dropdown.Option>(props: Dropdown.TriggerProps<T>) {
    return <div
        className="BaseTrigger"
        onClick={() => props.onToggleOpen()}
    >
        <span>{props.value?.label}</span>
        <Icon name="arrow_drop_down" />
    </div>
}

function BaseItem<T extends Dropdown.Option>(props: Dropdown.ItemProps<T>) {
    return <div
        className="BaseItem"
        data-selected={props.selected}
        onClick={() => props.onSelect()}
    >
        <span>{props.value.label}</span>
    </div>
}

function BaseContent<T extends Dropdown.Option>(props: Dropdown.ContentProps<T>) {
    const Item = props.item

    return <div
        className="BaseContent"
        data-open={props.isOpen}
    >
        {props.options.map(option => (
            <Item
                value={option}
                key={option.value}
                onSelect={() => {
                    props.onSelect(option)
                    props.onToggleOpen(false)
                }}
                selected={option.value === props.selected}
            />
        ))}
    </div>
}

export namespace Dropdown {

    export type Option = {
        label: string,
        value: string
    }

    export interface ContentProps<T extends Dropdown.Option> {
        options: T[],
        isOpen: boolean,
        item: (props: ItemProps<T>) => ReactNode,
        onToggleOpen: (isOpen?: boolean) => void,
        onSelect: (value: T | null) => void,
        selected: string | null
        size: UiSize
    }

    export interface TriggerProps<T extends Dropdown.Option> {
        value: T | null,
        isOpen: boolean,
        onToggleOpen: (isOpen?: boolean) => void,
        size: UiSize
    }

    export interface ItemProps<T extends Dropdown.Option> {
        value: T,
        selected: boolean,
        onSelect: () => void,
        size: UiSize
    }

}