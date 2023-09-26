import type { Graphable, HasContents, PlainObject } from "@graphorigami/core";
import type { AsyncGraph } from "@graphorigami/types";
import type { StringLike } from "../..";

export function extractFrontMatter(s: StringLike): { frontBlock: string, bodyText: string, frontData: PlainObject };
export function fromJson(obj: any): AsyncGraph;
export function fromYaml(obj: any): AsyncGraph;
export function parseYaml(text: string): PlainObject;
export function parseYamlWithExpressions(text: string): PlainObject;
export function renderFrontMatter(obj: any): string|(String & HasContents);
export function serializableObject(graph: Graphable): Promise<any>;
export function toJson(graph: Graphable | object): Promise<string>;
export function toSerializable(obj: any): any;
export function toYaml(graph: Graphable | object): Promise<string>;