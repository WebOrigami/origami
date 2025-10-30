import from from "../operations/from.js";
import isUnpackable from "./isUnpackable.js";

/**
 * Convert the indicated argument to a tree, or throw an exception.
 *
 * Tree operations can use this to validate the tree argument and provide more
 * helpful error messages. This also unpacks a unpackable tree argument so that
 * the caller can work with a simpler tree instead of a DeferredTree.
 *
 * @typedef {import("../../index.ts").AsyncMap} AsyncMap
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").Unpackable} Unpackable
 *
 * @param {Maplike|Unpackable} maplike
 * @param {string} operation
 * @param {{ deep?: boolean, position?: number }} [options]
 * @returns {Promise<Map|AsyncMap>}
 */
export default async function getTreeArgument(
  maplike,
  operation,
  options = {}
) {
  const deep = options.deep;
  const position = options.position ?? 0;

  if (isUnpackable(maplike)) {
    maplike = await maplike.unpack();
  }

  let tree;
  try {
    tree = from(maplike, { deep });
  } catch (/** @type {any} */ error) {
    let message = error.message ?? error;
    message = `${operation}: ${message}`;
    const newError = new TypeError(message);
    /** @type {any} */ (newError).position = position;
    throw newError;
  }
  return tree;
}
