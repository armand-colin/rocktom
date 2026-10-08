import type { Resource } from "@niloc/ecs";

export interface PreferencesScope extends Resource {
    recover(): void
}
