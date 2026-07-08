import { useResource } from "@niloc/ecs-react";
import "./ContextualMenuView.scss";
import { ContextualMenu, type ContextualMenuItem } from "../../resources/ContextualMenu";
import type { CSSProperties, MouseEvent } from "react";
import { Icon } from "../icon/Icon";

export function ContextualMenuView() {
	const contextualMenu = useResource(ContextualMenu)
	const { visible, position, items } = contextualMenu

	function onItemClick(item: ContextualMenuItem) {
		item.action()
		contextualMenu.close()
	}

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
			{items.map((item, index) => <div
				className="item"
				key={index}
				onClick={() => onItemClick(item)}
			>
				{
					item.icon ?
						<Icon name={item.icon} /> :
						null
				}
				{item.label}
			</div>)}
		</div>
	</div>
}