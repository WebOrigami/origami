import type { SyncOrAsyncMap } from "@weborigami/async-tree";
import type { JsonValue } from "../../index.ts";

export function evaluateYaml(text: string, parent?: SyncOrAsyncMap|null): Promise<JsonValue>;
export function parseYaml(text: string): JsonValue;
export function toJson(object: any): Promise<string>;
export function toYaml(object: any): Promise<string>;
