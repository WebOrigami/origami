import type { Treelike } from "@graphorigami/core";
import type { AsyncTree } from "@graphorigami/types";
import { StringLike } from "../../index";

export function extname(path: string): string;
export function getScope(tree: AsyncTree|null): AsyncTree;
export function treeWithScope(tree: Treelike, scope: AsyncTree|null): AsyncTree & { scope: AsyncTree };
export function isStringLike(obj: any): obj is StringLike;
export function isTransformApplied(Transform: Function, obj: any): boolean;
export const keySymbol: unique symbol;
export function toFunction(obj: any): Function;
export function transformObject(Transform: Function, obj: any): any;
