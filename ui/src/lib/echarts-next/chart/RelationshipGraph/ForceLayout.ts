export type ForceLayoutEngine= {
    step(cb: (stopped: boolean) => void): void
    warmUp(): void
    setFixed(idx: number): void
    setUnfixed(idx: number): void
}