/**
 * @typedef {import("../../index.ts").JsonValue} JsonValue
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 * @typedef {import("@weborigami/async-tree").SyncOrAsyncMap} SyncOrAsyncMap
 */

import { Tree, toPlainValue } from "@weborigami/async-tree";
import * as YAMLModule from "yaml";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * @param {string} text
 * @param {SyncOrAsyncMap|null} [parent]
 */
export async function evaluateYaml(text, parent) {
  const data = parseYaml(String(text));
  if (Tree.isMap(data)) {
    if ("parent" in data && data.parent !== undefined) {
      /** @type {any} */ (data).parent = parent;
    }
    return Tree.plain(data);
  } else {
    return data;
  }
}

/**
 * @param {string} text
 * @returns {JsonValue}
 */
export function parseYaml(text) {
  return YAML.parse(text);
}

/**
 * Serializes an object as a JSON string.
 *
 * @param {any} obj
 */
export async function toJson(obj) {
  const serializable = await toPlainValue(obj);
  return JSON.stringify(serializable, null, 2);
}

/**
 * Serializes an object as a JSON string.
 *
 * @param {any} obj
 * @returns {Promise<string>}
 */
export async function toYaml(obj) {
  const serializable = await toPlainValue(obj);
  return YAML.stringify(serializable);
}
