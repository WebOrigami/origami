/**
 * @typedef {import("../../index.ts").JsonValue} JsonValue
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 */

import { Tree, isPlainObject, isStringLike } from "@weborigami/async-tree";
import { OrigamiTree } from "@weborigami/language";
import * as YAMLModule from "yaml";
import yamlOrigamiTag from "../misc/yamlOrigamiTag.js";

const textDecoder = new TextDecoder();
const TypedArray = Object.getPrototypeOf(Uint8Array);

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 *
 * @param {string} text
 * @param {AsyncTree|null} [parent]
 */
export async function evaluateYaml(text, parent) {
  const data = parseYaml(String(text));
  if (Tree.isAsyncTree(data)) {
    data.parent = parent;
    return Tree.plain(data);
  } else {
    return data;
  }
}

/**
 * @param {any} obj
 * @returns {obj is JsonValue}
 */
function isJsonValue(obj) {
  const t = typeof obj;
  return (
    t === "boolean" ||
    t === "number" ||
    t === "string" ||
    obj instanceof Date ||
    obj === null
  );
}

// Return true if the given object has any functions in it.
function objectContainsFunctions(obj) {
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "function") {
      return true;
    } else if (isPlainObject(value)) {
      const valueContainsExpression = objectContainsFunctions(value);
      if (valueContainsExpression) {
        return true;
      }
    }
  }
  return false;
}

/**
 * @param {string} text
 * @returns {JsonValue|AsyncTree}
 */
export function parseYaml(text) {
  const data = YAML.parse(text, {
    customTags: [yamlOrigamiTag],
  });
  if (objectContainsFunctions(data)) {
    return new OrigamiTree(data);
  } else {
    return data;
  }
}

/**
 * Serializes an object as a JSON string.
 *
 * @param {any} obj
 */
export async function toJson(obj) {
  const serializable = await toJsonValue(obj);
  return JSON.stringify(serializable, null, 2);
}

/**
 * Convert the given object to a corresponding JSON value that can be serialized
 * as JSON or YAML.
 *
 * If the object is already a JSON value, it is returned as is.
 *
 * If the object implements the `pack()` method, that method's result will be
 * returned.
 *
 * If the object is treelike, it will be converted to a plain JavaScript
 * object, recursively traversing the tree and converting all values to native
 * types.
 *
 * If the object has a `valueOf()` or `toString()` method, that method's result
 * will be returned.
 *
 * @param {any} object
 * @returns {Promise<JsonValue>}
 */
export async function toJsonValue(object) {
  if (isJsonValue(object)) {
    return object;
  } else if (object && typeof object.pack === "function") {
    return object.pack();
  } else if (isStringLike(object) && !(object instanceof Array)) {
    return String(object);
  } else if (Tree.isTreelike(object)) {
    const mapped = await Tree.map(object, (value) => toJsonValue(value));
    return Tree.plain(mapped);
  } else if (object instanceof ArrayBuffer || object instanceof TypedArray) {
    // Serialize data as UTF-8.
    return textDecoder.decode(object);
  }

  throw new TypeError("Couldn't serialize object");
}

/**
 * Serializes an object as a JSON string.
 *
 * @param {any} obj
 * @returns {Promise<string>}
 */
export async function toYaml(obj) {
  const serializable = await toJsonValue(obj);
  return YAML.stringify(serializable);
}
