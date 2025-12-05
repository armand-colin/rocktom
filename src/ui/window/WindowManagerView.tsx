import { EngineContext, useResource } from "@niloc/ecs-react";
import type { Vec2 } from "@niloc/utils";
import { useContext, useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { WindowManager } from "../../resources/WindowManager";
import type { Handler } from "../../utils/handlers/Handler";
import { Mover } from "../../utils/handlers/Mover";
import { EastResizer, NorthResizer, Resizer, SouthResizer, WestResizer, type ResizerOpts } from "../../utils/handlers/Resizer";
import { Icon } from "../icon/Icon";
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



function WindowView(props: {
	id: string,
	size: Vec2,
	position: Vec2,
	name: string,
	children: ReactNode,
	close: () => void
}) {
	const { engine } = useContext(EngineContext)
	const windowManager = engine.getResource(WindowManager)
	const handler = useRef<Handler | null>(null)

	function onHeadMouseDown(e: MouseEvent) {
		handler.current?.destroy()
		e.preventDefault()

		const mover = new Mover({
			event: e.nativeEvent,
			position: props.position,
			size: props.size,
			windowSize: windowManager.windowSize
		})

		mover.events.on("changed", (position: Vec2) => {
			windowManager.setPosition(props.id, position)
		})

		handler.current = mover
	}

	function onResize(resizerClass: { new(opts: ResizerOpts): Resizer }) {
		return (e: MouseEvent) => {
			handler.current?.destroy()
			e.preventDefault()

			const resizer = new resizerClass({
				event: e.nativeEvent,
				position: props.position,
				size: props.size,
				// TODO: Parametrize
				minSize: { x: 200, y: 100 },
				windowSize: windowManager.windowSize
			})

			resizer.events.on("changed", (transform) => {
				windowManager.setTransform(props.id, transform)
			})

			handler.current = resizer
		}
	}

	useEffect(() => {
		return () => {
			handler.current?.destroy()
			handler.current = null
		}
	}, [])

	return <div
		className="WindowView"
		style={{
			"--width": props.size.x,
			"--height": props.size.y,
			"--x": props.position.x,
			"--y": props.position.y,
		} as CSSProperties}
	>
		<div
			className="head"
			onMouseDown={onHeadMouseDown}
		>
			<p>{props.name}</p>
			<div
				className="close"
				onClick={props.close}
				onMouseDown={e => e.preventDefault()}
			>
				<Icon name="close" />
			</div>
		</div>
		<div className="content">
			{props.children}
		</div>

		<div className="resizer" data-direction="east" onMouseDown={onResize(EastResizer)}></div>
		<div className="resizer" data-direction="south" onMouseDown={onResize(SouthResizer)}></div>
		<div className="resizer" data-direction="north" onMouseDown={onResize(NorthResizer)}></div>
		<div className="resizer" data-direction="west" onMouseDown={onResize(WestResizer)}></div>
	</div>
}
