import { Tree, getRealmObjectPrototype } from "@graphorigami/async-tree";

/**
 * Concatenate the text values in a tree.
 *
 * This is a map-reduce operation: convert everything to strings, then
 * concatenate the strings.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {import("@graphorigami/async-tree").Treelike} treelike
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

  // Convert to text, preferring .toString but avoiding dumb Object.toString.
  // Exception: if the result is an array, we'll concatenate the values.
  let text;
  if (!value) {
    // Treat falsy values as the empty string.
    text = "";
  } else if (typeof value === "string") {
    text = value;
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
