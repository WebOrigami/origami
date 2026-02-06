import TraverseError from "../TraverseError.js";
import * as args from "../utilities/args.js";
import traverseOrThrow from "./traverseOrThrow.js";

/**
 * Return the value at the corresponding path of keys.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {...any} keys
 */
export default async function traverse(maplike, ...keys) {
  const map = await args.map(maplike, "Tree.traverse");
  try {
    // Await the result here so that, if the path doesn't exist, the catch
    // block below will catch the exception.
    return await traverseOrThrow(map, ...keys);
  } catch (/** @type {any} */ error) {
    if (error instanceof TraverseError) {
      return undefined;
    } else {
      throw error;
    }
  }
}
