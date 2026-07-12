import { useResource } from "@niloc/ecs-react";
import "./ContextualMenuView.scss";
import { ContextualMenu } from "../../resources/contextualMenu/ContextualMenu";
import type { CSSProperties, MouseEvent } from "react";
import { Icon } from "../icon/Icon";
import type { ContextualMenuItem } from "../../resources/contextualMenu/ContextualMenuItem";

export function ContextualMenuView() {
	const contextualMenu = useResource(ContextualMenu)
	const { visible, position, items } = contextualMenu

	function onMenuMouseDown(e: MouseEvent) {
		e.stopPropagation()
	}

	return <div
		className="ContextualMenuView"
		data-visible={visible}
	>
		<div
			className="backdrop"
			onMouseDown={() => contextualMenu.close()}
		/>
		<div
			className="menu"
			style={{
				"--x": position.x,
				"--y": position.y
			} as CSSProperties}
			onMouseDown={onMenuMouseDown}
		>
			{items.map((item, index) => <Item 
				close={() => contextualMenu.close()}
				item={item}
				key={index}
			/>)}
		</div>
	</div>
}

function Item(props: { item: ContextualMenuItem, close: () => void }) {
	if (props.item.type === 'separator') {
		return <div className="separator" />
	}

	if (props.item.type === "custom") {
		return props.item.component(props.close)
	}

	function onClick() {
		if (props.item.type === "action") {
			props.item.action()
			props.close()
		}
	}

	return <div className="item" onClick={onClick}>
		{
			props.item.icon ?
				<Icon name={props.item.icon} /> :
				null
		}
		{props.item.label}
	</div>
}