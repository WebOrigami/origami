import type { Graphable } from "@graphorigami/core";
import type { AsyncDictionary } from "@graphorigami/types";
import type { JsonValue } from "../..";

export function parseDocumentWithFrontMatter(text: string): { data: JsonValue|AsyncDictionary|null, text: string };
export function parseYaml(text: string): JsonValue|AsyncDictionary;
export function renderDocumentWithFrontMatter(text: string, data: JsonValue|AsyncDictionary|null): Promise<string>;
export function serializableObject(obj: any): Promise<any>;
export function toJson(graph: Graphable | object): Promise<string>;
export function toSerializable(obj: any): any;
export function toYaml(graph: Graphable | object): Promise<string>;