import type { AsyncTree } from "@graphorigami/types";
import type { JsonValue } from "../../index.ts";

export function evaluateYaml(text: string, parent?: AsyncTree|null): Promise<JsonValue>;
export function parseYaml(text: string): JsonValue|AsyncTree;
export function toJson(obj: JsonValue | AsyncTree): Promise<string>;
export function toJsonValue(obj: any): Promise<JsonValue>;
export function toYaml(obj: JsonValue | AsyncTree): Promise<string>;