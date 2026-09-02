import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { LevelEntity } from "../../queries/level/LevelEntity";
import { StringInput } from "../input/StringInput";
import { NumberInput } from "../input/NumberInput";
import { LevelListItem } from "./LevelListItem";

const mockLevel: LevelEntity = {
    id: "level-1",
    userId: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    name: "Rock Session",
    serialized: "{}",
    duration: 185,
    instrumentTypes: ["drums"],
};

const meta = {
    title: "UI/LevelListItem",
    component: LevelListItem,
} satisfies Meta<typeof LevelListItem>;

export default meta;

export const Main = () => {
    const [name, setName] = useState(mockLevel.name);
    const [duration, setDuration] = useState(mockLevel.duration);

    const level: LevelEntity = {
        ...mockLevel,
        instrumentTypes: ["bass"],
        name,
        duration,
    };

    return (
        <div className="grid gap-4" style={{ maxWidth: 420 }}>
            <LevelListItem
                className="max-w-100"
                level={level}
                onSelect={() => { }}
                onMenuOpen={() => { }}
            />
            <div className="grid gap-3">
                <StringInput
                    name="name"
                    value={name}
                    onChange={setName}
                />
                <NumberInput
                    name="duration"
                    value={duration}
                    min={0}
                    onChange={setDuration}
                />
            </div>
        </div>
    );
}
