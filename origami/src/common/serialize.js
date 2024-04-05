/**
 * @typedef {import("../../index.ts").JsonValue} JsonValue
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 */

import {
  Tree,
  isPlainObject,
  isStringLike,
  isUnpackable,
} from "@weborigami/async-tree";
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
 * Convert the given object to a corresponding JSON value that can be
 * represented as JSON or YAML.
 *
 * @param {any} object
 * @returns {Promise<JsonValue>}
 */
export async function toJsonValue(object) {
  return toValue(object, true);
}

/**
 * Convert the given input to the plainest possible JavaScript value. This
 * helper is intended for functions that want to accept an argument from the ori
 * CLI, which could a string, a file buffer, an ArrayBuffer from a URL, or some
 * other kind of JavaScript object.
 *
 * If the input implements the `unpack()` method, the input will be unpacked and
 * before processing.
 *
 * If the input is treelike, it will be converted to a plain JavaScript object,
 * recursively traversing the tree and converting all values to plain types.
 *
 * If the input is stringlike, its text will be returned.
 *
 * If the input is a Buffer or ArrayBuffer, it will be interpreted as UTF-8
 * text.
 *
 * If the input has a custom class instance, its public properties will be
 * returned as a plain object.
 *
 * The `jsonValuesOnly` parameter can be set to `true` to ensure that the
 * returned value can be represented as JSON. If the input can't be represented
 * as JSON, an error is thrown.
 *
 * @param {any} input
 * @param {boolean} [jsonValuesOnly]
 * @returns {Promise<any>}
 */
export async function toValue(input, jsonValuesOnly = false) {
  if (input instanceof Promise) {
    // Resolve promise before processing.
    return toValue(await input, jsonValuesOnly);
  } else if (isJsonValue(input)) {
    return input;
  } else if (typeof input !== "object") {
    if (jsonValuesOnly) {
      throw new TypeError(`Couldn't serialize value to JSON: ${input}`);
    } else {
      return input;
    }
  } else if (isUnpackable(input)) {
    // Unpack first, then convert to JSON value.
    const unpacked = await input.unpack();
    return toValue(unpacked);
  } else if (isStringLike(input) && !(input instanceof Array)) {
    return String(input);
  } else if (Tree.isTreelike(input)) {
    const mapped = await Tree.map(input, (value) => toValue(value));
    return Tree.plain(mapped);
  } else if (input instanceof ArrayBuffer || input instanceof TypedArray) {
    // Interpret input as UTF-8 text.
    return textDecoder.decode(input);
  } else {
    // Some other kind of class instance; return its public properties.
    const plain = {};
    for (const [key, value] of Object.entries(input)) {
      plain[key] = await toValue(value);
    }
    return plain;
  }
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
