import ObjectMap from "../drivers/ObjectMap.js";
import isMaplike from "../operations/isMaplike.js";
import mapReduce from "../operations/mapReduce.js";
import * as trailingSlash from "../trailingSlash.js";
import castArraylike from "./castArraylike.js";
import isPrimitive from "./isPrimitive.js";
import isStringlike from "./isStringlike.js";
import toString from "./toString.js";
import TypedArray from "./TypedArray.js";

/**
 * Convert the given input to the plainest possible JavaScript value. This is
 * useful for rendering data for display or serialization.
 *
 * If the input is a function, it will be invoked and its result will be
 * processed.
 *
 * If the input is a promise, it will be resolved and its result will be
 * processed.
 *
 * If the input is maplike, it will be converted to a plain JavaScript object,
 * recursively traversing the tree and converting all values to plain types.
 *
 * If the input is stringlike, its text will be returned.
 *
 * If the input is a ArrayBuffer or typed array, it will be interpreted as UTF-8
 * text if it does not contain unprintable characters. If it does, it will be
 * returned as a base64-encoded string.
 *
 * If the input has a custom class instance, its public properties will be
 * returned as a plain object.
 *
 * @param {any} input
 * @param {import("../../index.ts").ReduceFn} [reduceFn]
 * @returns {Promise<any>}
 */
export default async function toPlainValue(
  input,
  reduceFn = reduceToPlainObject
) {
  if (input instanceof Function) {
    // Invoke function
    input = input();
  }
  if (input instanceof Promise) {
    // Resolve promise
    input = await input;
  }

  if (isPrimitive(input) || input instanceof Date) {
    return input;
  } else if (isMaplike(input)) {
    // Recursively convert tree to plain object.
    return mapReduce(input, (value) => toPlainValue(value, reduceFn), reduceFn);
  } else if (input instanceof ArrayBuffer || input instanceof TypedArray) {
    // Try to interpret the buffer as UTF-8 text, otherwise use base64.
    const text = toString(input);
    if (text !== null) {
      return text;
    } else {
      return toBase64(input);
    }
  } else if (isStringlike(input)) {
    return toString(input);
  } else {
    // Some other kind of class instance; return its public properties.
    const plain = {};
    for (const [key, value] of Object.entries(input)) {
      plain[key] = await toPlainValue(value);
    }
    return plain;
  }
}

function reduceToPlainObject(mapped, source) {
  // Normalize slashes in keys.
  const keys = Array.from(mapped.keys()).map(trailingSlash.remove);
  // Special case for an empty tree: if based on array, return array.
  if (source instanceof ObjectMap && keys.length === 0) {
    return /** @type {any} */ (source).object instanceof Array ? [] : {};
  }
  return castArraylike(keys, Array.from(mapped.values()));
}

function toBase64(object) {
  if (typeof Buffer !== "undefined") {
    // Node.js environment
    return Buffer.from(object).toString("base64");
  } else {
    // Browser environment
    let binary = "";
    const bytes = new Uint8Array(object);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
