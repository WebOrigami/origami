import type { AsyncGraph } from "@graphorigami/types";
import { Graphable, PlainObject } from "..";

export * from "./Dictionary";

export function assign(target: Graphable, source: Graphable): Promise<AsyncGraph>;
export const defaultValueKey: Symbol;
export function from(graph: Graphable): AsyncGraph;
export function isGraphable(obj: any): boolean;
export function isKeyForSubgraph(graph: AsyncGraph, obj: any): Promise<boolean>;
export function keysFromPath(path: string): string[];
export function map(graph: Graphable, mapFn: (any) => any): Promise<AsyncGraph>;
export function mapReduce(graph: Graphable, mapFn: null|((any) => any|null), reduceFn: (any) => any): Promise<any>;
export function plain(graph: Graphable): Promise<PlainObject>;
export function toFunction(graph: Graphable): Function;
export function traverse(graph: Graphable, ...keys: any[]): Promise<any>;
export function traverseOrThrow(graph: Graphable, ...keys: any[]): Promise<any>;
export function traversePath(graph: Graphable, path: string): Promise<any>;
