import { assertIsTreelike } from "../utilities.js";
import entries from "./entries.js";
import from from "./from.js";
import isTreelike from "./isTreelike.js";
import plain from "./plain.js";

/**
 * Add nextKey/previousKey properties to values.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").PlainObject} PlainObject
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @returns {Promise<PlainObject|Array>}
 */
export default async function addNextPrevious(treelike) {
  assertIsTreelike(treelike, "addNextPrevious");
  const tree = from(treelike);

  const treeEntries = [...(await entries(tree))];
  const keys = treeEntries.map(([key]) => key);

  // Map to an array of [key, result] pairs, where the result includes
  // nextKey/previousKey properties.
  const mappedEntries = await Promise.all(
    treeEntries.map(async ([key, value], index) => {
      let resultValue;
      if (value === undefined) {
        resultValue = undefined;
      } else if (isTreelike(value)) {
        resultValue = await plain(value);
      } else if (typeof value === "object") {
        // Clone value to avoid modifying the original object
        resultValue = { ...value };
      } else {
        // Take the object as the `value` property
        resultValue = { value };
      }

      if (resultValue) {
        // Extend result with nextKey/previousKey properties.
        const nextKey = keys[index + 1];
        if (nextKey) {
          resultValue.nextKey = nextKey;
        }
        const previousKey = keys[index - 1];
        if (previousKey) {
          resultValue.previousKey = previousKey;
        }
      }

      return [key, resultValue];
    })
  );

  return treelike instanceof Array
    ? mappedEntries.map(([_, value]) => value)
    : Object.fromEntries(mappedEntries);
}
