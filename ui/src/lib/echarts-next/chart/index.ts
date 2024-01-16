import type { RelationshipGraphOption } from "./RelationshipGraph"

export type SeriesItemMap={
    'relationship':RelationshipGraphOption
}
export type SeriesItemOption<T> = T extends {type:infer U extends keyof SeriesItemMap}?SeriesItemMap[U]:never