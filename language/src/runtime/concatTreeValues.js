import {
  Tree,
  getRealmObjectPrototype,
  isPlainObject,
} from "@weborigami/async-tree";

const textDecoder = new TextDecoder();
const TypedArray = Object.getPrototypeOf(Uint8Array);

/**
 * Concatenate the text values in a tree.
 *
 * This is a map-reduce operation: convert everything to strings, then
 * concatenate the strings.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {import("@weborigami/async-tree").Treelike} treelike
 */
export default async function concatTreeValues(treelike) {
  const scope = this;
  const mapFn = async (value) => getText(value, scope);
  const reduceFn = (values) => values.join("");
  return Tree.mapReduce(treelike, mapFn, reduceFn);
}

async function getText(value, scope) {
  // If the value is a function (e.g., a lambda), call it and use its result.
  if (typeof value === "function") {
    value = await value.call(scope);
  }

  // We'd prefer to use Tree.isTreelike() here, but that counts an object with
  // an unpack() function as a treelike object. In this case, we don't want to
  // unpack anything that's not already treelike.
  const isTreelike =
    Tree.isAsyncTree(value) ||
    value instanceof Function ||
    value instanceof Array ||
    value instanceof Set ||
    isPlainObject(value);
  if (isTreelike) {
    // The mapReduce operation above only implicit casts its top-level input to
    // a tree. If we're asked for the text of a treelike value, we need to
    // explicitly recurse.
    return concatTreeValues.call(scope, value);
  }

  // Convert to text, preferring .toString but avoiding dumb Object.toString.
  // Exception: if the result is an array, we'll concatenate the values.
  let text;
  if (!value) {
    // Treat falsy values as the empty string.
    text = "";
  } else if (typeof value === "string") {
    text = value;
  } else if (value instanceof ArrayBuffer || value instanceof TypedArray) {
    // Serialize data as UTF-8.
    text = textDecoder.decode(value);
  } else if (
    !(value instanceof Array) &&
    value.toString !== getRealmObjectPrototype(value).toString
  ) {
    text = value.toString();
  } else {
    // Anything else maps to the empty string.
    text = "";
  }

  return text;
}
