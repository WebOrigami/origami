import type { AsyncDictionary } from "@graphorigami/types";
import type { JsonValue } from "../..";

export function parseYaml(text: string): JsonValue|AsyncDictionary;
export function toJson(obj: JsonValue | AsyncDictionary): Promise<string>;
export function toJsonValue(obj: JsonValue | AsyncDictionary): any;
export function toYaml(obj: JsonValue | AsyncDictionary): Promise<string>;