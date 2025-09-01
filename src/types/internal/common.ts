import type { Branded } from "@/composables/brand";

export type Nullable<T> = { [K in keyof T]: T[K] | null };

export type DurationInMS = Branded<number, "DurationInMS">;
