import type { PlainObject, Treelike } from "@graphorigami/core";
import type { AsyncDictionary } from "@graphorigami/types";
import { StringLike } from "../../index";

export function castArrayLike(obj: any): any;
export function extname(path: string): string;
export function getRealmObjectPrototype(obj: any): any;
export function getScope(tree: AsyncDictionary|null): AsyncDictionary;
export function treeInContext(tree: Treelike, context: AsyncDictionary|null): AsyncDictionary & { parent: AsyncDictionary };
export function treeWithScope(tree: Treelike, ...scopes: (Treelike|null)[]): AsyncDictionary & { scope: AsyncDictionary };
export function isPlainObject(obj: any): obj is PlainObject;
export function isStringLike(obj: any): obj is StringLike;
export function isTransformApplied(Transform: Function, obj: any): boolean;
export const keySymbol: unique symbol;
export function toFunction(obj: any): Function;
export function transformObject(Transform: Function, obj: any): any;