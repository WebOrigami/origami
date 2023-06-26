import type { GraphVariant } from "@graphorigami/core";
import type { AsyncDictionary } from "@graphorigami/types";
import type { Invocable } from "./explorable";

export function castArrayLike(obj: any): any;
export function extname(path: string): string;
export function getRealmObjectPrototype(obj: any): any;
export function getScope(graph: AsyncDictionary|null): AsyncDictionary;
export function graphInContext(graph: GraphVariant, context: AsyncDictionary|null): AsyncDictionary & { parent: AsyncDictionary };
export function isPlainObject(obj: any): boolean;
export function isTransformApplied(Transform: Function, obj: any): boolean;
export function keysFromPath(pathname: string): string[];
export const keySymbol: unique symbol;
export function sortNatural(values: any[]): any[]
export function stringLike(value: any): boolean;
export function toFunction(obj: Invocable): Function;
export function transformObject(Transform: Function, obj: any): any;