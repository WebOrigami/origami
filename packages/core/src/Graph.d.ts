import type { AsyncGraph } from "@graphorigami/types";
import { GraphVariant, PlainObject } from "..";

export * from "./Dictionary";

export function assign(target: GraphVariant, source: GraphVariant): Promise<AsyncGraph>;
export const defaultValueKey: Symbol;
export function from(graph: GraphVariant): AsyncGraph;
export function isGraphable(obj: any): boolean;
export function isKeyForSubgraph(graph: AsyncGraph, obj: any): Promise<boolean>;
export function keysFromPath(path: string): string[];
export function map(graph: GraphVariant, mapFn: (any) => any): Promise<AsyncGraph>;
export function mapReduce(graph: GraphVariant, mapFn: null|((any) => any|null), reduceFn: (any) => any): Promise<any>;
export function plain(graph: GraphVariant): Promise<PlainObject>;
export function toFunction(graph: GraphVariant): Function;
export function traverse(graph: GraphVariant, ...keys: any[]): Promise<any>;
export function traverseOrThrow(graph: GraphVariant, ...keys: any[]): Promise<any>;
export function traversePath(graph: GraphVariant, path: string): Promise<any>;
