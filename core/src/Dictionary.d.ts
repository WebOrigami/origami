import type { AsyncDictionary, AsyncMutableDictionary } from "@graphorigami/types";
import { PlainObject } from "..";

export const defaultValueKey: Symbol;

export function clear(AsyncDictionary: AsyncMutableDictionary): Promise<void>;
export function entries(AsyncDictionary: AsyncDictionary): Promise<IterableIterator<any>>;
export function forEach(AsyncDictionary: AsyncDictionary, callbackfn: (value: any, key: any) => Promise<void>): Promise<void>;
export function getRealmObjectPrototype(object: any): any;
export function has(AsyncDictionary: AsyncDictionary, key: any): Promise<boolean>;
export function isAsyncDictionary(obj: any): obj is AsyncDictionary;
export function isAsyncMutableDictionary(obj: any): obj is AsyncMutableDictionary;
export function isPlainObject(obj: any): obj is PlainObject;
export function remove(AsyncDictionary: AsyncMutableDictionary, key: any): Promise<boolean>;
export function values(AsyncDictionary: AsyncDictionary): Promise<IterableIterator<any>>;
