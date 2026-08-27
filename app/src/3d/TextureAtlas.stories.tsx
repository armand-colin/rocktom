import { useComponent } from "@niloc/ecs-react"
import { useEffect, useMemo, useRef } from "react"
import { Instance } from "../Instance"
import { AtlasPalette } from "./AtlasPalette"
import { AtlasSprite, TextureAtlas } from "./TextureAtlas"

const LABEL_SIZE = 72

export default {
    title: "3D/TextureAtlas",
}

export const Flat = () => {
    const atlas = useMemo(() => TextureAtlas.load(Instance.engine), [])
    const { isReady, generation } = useComponent(atlas)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !isReady)
            return

        const source = atlas.canvas
        canvas.width = source.width
        canvas.height = source.height

        const context = canvas.getContext("2d")!
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(source, 0, 0)

        const stride = TextureAtlas.stride
        const columns = atlas.columnCount
        context.strokeStyle = "rgba(255, 255, 255, 0.28)"
        context.lineWidth = 1

        for (let column = 0; column <= columns; column++) {
            const x = column * stride + 0.5
            context.beginPath()
            context.moveTo(x, 0)
            context.lineTo(x, canvas.height)
            context.stroke()
        }

        for (let row = 0; row <= AtlasPalette.count; row++) {
            const y = row * stride + 0.5
            context.beginPath()
            context.moveTo(0, y)
            context.lineTo(canvas.width, y)
            context.stroke()
        }
    }, [atlas, isReady, generation])

    const columns = atlas.columnCount

    return (
        <div style={{ padding: 16, color: "#eee", fontFamily: "Lexend, sans-serif" }}>
            <div style={{ marginBottom: 12, opacity: 0.8 }}>
                {isReady ? `${columns} sprites × ${AtlasPalette.count} colors` : "Loading atlas…"}
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `${LABEL_SIZE}px minmax(0, 1fr)`,
                    gridTemplateRows: `${LABEL_SIZE}px auto`,
                    maxWidth: 1280,
                }}
            >
                <div />
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                        fontSize: 10,
                        lineHeight: 1.1,
                    }}
                >
                    {Array.from({ length: columns }, (_, index) => (
                        <div
                            key={index}
                            style={{
                                padding: "0 2px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                transform: "rotate(-45deg)",
                                transformOrigin: "left bottom",
                                height: LABEL_SIZE,
                            }}
                            title={AtlasSprite.label(index)}
                        >
                            {AtlasSprite.label(index)}
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateRows: `repeat(${AtlasPalette.count}, minmax(0, 1fr))`,
                        fontSize: 12,
                    }}
                >
                    {AtlasPalette.labels.map((label, index) => (
                        <div
                            key={label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                paddingRight: 8,
                                color: AtlasPalette.css(index),
                            }}
                        >
                            <span
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 2,
                                    background: AtlasPalette.css(index),
                                    flexShrink: 0,
                                }}
                            />
                            {label}
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        backgroundImage: "repeating-conic-gradient(#3a3a3a 0% 25%, #222 0% 50%)",
                        backgroundSize: "16px 16px",
                        overflow: "hidden",
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        style={{
                            display: "block",
                            width: "100%",
                            height: "auto",
                            opacity: isReady ? 1 : 0.3,
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
