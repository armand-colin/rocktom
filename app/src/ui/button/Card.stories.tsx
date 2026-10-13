import { Card } from "./Card"

export default {
    title: "UI/Card",
    component: Card,
}

export const Default = () => {
    return (
        <div className="flex gap-4 items-start">
            {([1, 2, 3] as const).map(elevation => (
                <Card
                    key={elevation}
                    elevation={elevation}
                    className="w-40"
                    containerClassName="p-4"
                >
                    Elevation {elevation}
                </Card>
            ))}
        </div>
    )
}
