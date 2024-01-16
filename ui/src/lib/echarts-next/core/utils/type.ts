export type Merge<T, U> = {
    [K in keyof (T & U)]:
        K extends (keyof T & keyof U)
      ? T[K]|U[K]
      : K extends keyof U
      ? U[K]
      : K extends keyof T
      ? T[K]
      : never;
  };
