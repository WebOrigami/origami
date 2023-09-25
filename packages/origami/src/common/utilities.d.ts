import type { Graphable } from "@graphorigami/core";
import type { AsyncDictionary } from "@graphorigami/types";

export function castArrayLike(obj: any): any;
export function extname(path: string): string;
export function getRealmObjectPrototype(obj: any): any;
export function getScope(graph: AsyncDictionary|null): AsyncDictionary;
export function graphInContext(graph: Graphable, context: AsyncDictionary|null): AsyncDictionary & { parent: AsyncDictionary };
export function isPlainObject(obj: any): boolean;
export function isTransformApplied(Transform: Function, obj: any): boolean;
export const keySymbol: unique symbol;
export function stringLike(value: any): boolean;
export function toFunction(obj: any): Function;
export function transformObject(Transform: Function, obj: any): any;