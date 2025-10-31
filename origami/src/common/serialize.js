/**
 * @typedef {import("../../index.ts").JsonValue} JsonValue
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 * @typedef {import("@weborigami/async-tree").SyncOrAsyncMap} SyncOrAsyncMap
 */

import {
  castArraylike,
  SyncMap,
  toPlainValue,
  trailingSlash,
} from "@weborigami/async-tree";
import * as YAMLModule from "yaml";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * @param {string} text
 * @returns {JsonValue}
 */
export function parseYaml(text) {
  return YAML.parse(text);
}

function reduceToMap(values, keys, map) {
  // Normalize slashes in keys.
  keys = keys.map(trailingSlash.remove);
  return castArraylike(keys, values, (entries) => new SyncMap(entries));
}

/**
 * Serializes an object as a JSON string.
 *
 * @param {any} object
 */
export async function toJson(object) {
  const serializable = await toPlainValue(object);
  return JSON.stringify(serializable, null, 2);
}

/**
 * Serializes an object as a JSON string.
 *
 * @param {any} object
 * @returns {Promise<string>}
 */
export async function toYaml(object) {
  const serializable = await toPlainValue(object, reduceToMap);
  return YAML.stringify(serializable);
}
