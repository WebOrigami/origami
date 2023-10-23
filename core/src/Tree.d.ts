import type { AsyncMutableTree, AsyncTree } from "@graphorigami/types";
import { PlainObject, Treelike } from "..";

export * from "./Dictionary";

export function assign(target: Treelike, source: Treelike): Promise<AsyncTree>;
export function from(obj: any): AsyncTree;
export function isAsyncTree(obj: any): obj is AsyncTree;
export function isAsyncMutableTree(obj: any): obj is AsyncMutableTree;
export function isTreelike(obj: any): obj is Treelike;
export function isKeyForSubtree(tree: AsyncTree, obj: any): Promise<boolean>;
export function keysFromPath(path: string): string[];
export function map(tree: Treelike, mapFn: (any) => any): Promise<AsyncTree>;
export function mapReduce(tree: Treelike, mapFn: null|((any) => any|null), reduceFn: (any) => any): Promise<any>;
export function plain(tree: Treelike): Promise<PlainObject>;
export function toFunction(tree: Treelike): Function;
export function traverse(tree: Treelike, ...keys: any[]): Promise<any>;
export function traverseOrThrow(tree: Treelike, ...keys: any[]): Promise<any>;
export function traversePath(tree: Treelike, path: string): Promise<any>;
