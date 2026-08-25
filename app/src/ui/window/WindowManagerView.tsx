import { useResource } from "@niloc/ecs-react";
import { WindowManager } from "../../resources/WindowManager";
import { WindowView } from "./WindowView";
import "./WindowManagerView.scss";

export function WindowManagerView() {
	const windowManager = useResource(WindowManager)

	return <div className="WindowManagerView">
		{
			windowManager.windows.map(window => <WindowView
				key={window.id}
				id={window.id}
				size={window.size}
				position={window.position}
				name={window.name}
				close={window.close}
			>
				{window.content}
			</WindowView>)
		}
	</div>
}
