import type { Graphable, HasGraph, PlainObject } from "@graphorigami/core";
import type { AsyncGraph } from "@graphorigami/types";
import type { HasString, StringLike } from "../..";

export function extractFrontMatter(s: StringLike): { frontBlock: string, bodyText: string, frontData: PlainObject };
export function fromJson(obj: any): AsyncGraph;
export function fromYaml(obj: any): AsyncGraph;
export function outputWithGraph(obj: HasString, graph?: Graphable, emitFrontMatter?: boolean): string|(String & HasGraph);
export function parseYaml(text: string): PlainObject;
export function parseYamlWithExpressions(text: string): PlainObject;
export function serializableObject(graph: Graphable): Promise<any>;
export function toJson(graph: Graphable | object): Promise<string>;
export function toSerializable(obj: any): any;
export function toYaml(graph: Graphable | object): Promise<string>;