import type { Treelike } from "@graphorigami/core";
import type { AsyncTree } from "@graphorigami/types";

export const keySymbol: unique symbol;
export function extname(path: string): string;
export function isTransformApplied(Transform: Function, obj: any): boolean;
export function toFunction(obj: any): Function;
export function transformObject(Transform: Function, obj: any): any;
export function treeWithScope(tree: Treelike, scope: AsyncTree|null): AsyncTree & { scope: AsyncTree };
