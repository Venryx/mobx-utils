export declare type ITransformer<A, B> = (object: A) => B
export interface ITransformerParams<A, B> {
    onCleanup?: (resultObject: B | undefined, sourceObject?: A) => void
    debugNameGenerator?: (sourceObject?: A) => string
}
/**
 * Creates a function that maps an object to a view.
 * The mapping is memoized.
 *
 * See: https://mobx.js.org/refguide/create-transformer.html
 */
export declare function createTransformer<A, B>(
    transformer: ITransformer<A, B>,
    onCleanup?: (resultObject: B | undefined, sourceObject?: A) => void
): ITransformer<A, B>
export declare function createTransformer<A, B>(
    transformer: ITransformer<A, B>,
    arg2?: ITransformerParams<A, B>
): ITransformer<A, B>
