//https://stackoverflow.com/questions/52931116/decompose-a-typescript-union-type-into-specific-types
export declare type UnionToParm<U> = U extends any ? (k: U) => void : never;
export declare type UnionToSect<U> = UnionToParm<U> extends ((k: infer I) => void) ? I : never;
export declare type ExtractParm<F> = F extends { (a: infer A): void } ? A : never;

export declare type SpliceOne<Union> = Exclude<Union, ExtractOne<Union>>;
export declare type ExtractOne<Union> = ExtractParm<UnionToSect<UnionToParm<Union>>>;

export declare type ToTuple<Union> = ToTupleRec<Union, []>;
export declare type ToTupleRec<Union, Rslt extends any[]> =
    SpliceOne<Union> extends never ? [ExtractOne<Union>, ...Rslt]
    : ToTupleRec<SpliceOne<Union>, [ExtractOne<Union>, ...Rslt]>
;
