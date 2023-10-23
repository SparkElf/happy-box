type AnyFn=(...args: any)=>any
export type Fn<T> = T extends AnyFn?T:never

export const noop=()=>{}
