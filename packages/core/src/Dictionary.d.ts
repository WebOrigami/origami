import type { AsyncDictionary, AsyncMutableDictionary } from "@graphorigami/types";

export function clear(AsyncDictionary: AsyncMutableDictionary): Promise<void>;
export function entries(AsyncDictionary: AsyncDictionary): Promise<IterableIterator<any>>;
export function forEach(AsyncDictionary: AsyncDictionary, callbackfn: (value: any, key: any) => Promise<void>): Promise<void>;
export function getRealmObjectPrototype(object: any): any;
export function has(AsyncDictionary: AsyncDictionary, key: any): Promise<boolean>;
export function isAsyncDictionary(object: any): boolean;
export function isAsyncMutableDictionary(object: any): boolean;
export function isPlainObject(object: any): boolean;
export function remove(AsyncDictionary: AsyncMutableDictionary, key: any): Promise<boolean>;
// export function toFunction(graph: Graphable): Function;
export function values(AsyncDictionary: AsyncDictionary): Promise<IterableIterator<any>>;
