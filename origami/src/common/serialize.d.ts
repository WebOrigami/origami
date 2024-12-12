import type { AsyncTree } from "@weborigami/types";
import type { JsonValue } from "../../index.ts";

export function evaluateYaml(text: string, parent?: AsyncTree|null): Promise<JsonValue>;
export function parseYaml(text: string): JsonValue;
export function toJson(obj: JsonValue | AsyncTree): Promise<string>;
export function toYaml(obj: JsonValue | AsyncTree): Promise<string>;