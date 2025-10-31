import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import keys from "./keys.js";

/**
 * Return a map that adds nextKey/previousKey properties to values.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @returns {Promise<AsyncMap>}
 */
export default async function addNextPrevious(maplike) {
  const source = await getTreeArgument(maplike, "addNextPrevious");
  let sourceKeys;

  return Object.assign(new AsyncMap(), {
    async get(key) {
      const sourceValue = await source.get(key);
      const resultValue = {};
      if (typeof sourceValue === "object") {
        // Copy to avoid modifying the original object
        Object.assign(resultValue, sourceValue);
      } else {
        // Take the object as the `value` property
        resultValue.value = sourceValue;
      }

      // Find the index of the current key
      sourceKeys ??= await keys(source);
      const index = sourceKeys.indexOf(key);
      if (index >= 0) {
        // Extend result with nextKey/previousKey properties.
        const nextKey = sourceKeys[index + 1];
        if (nextKey) {
          resultValue.nextKey = nextKey;
        }
        const previousKey = sourceKeys[index - 1];
        if (previousKey) {
          resultValue.previousKey = previousKey;
        }
      }

      return resultValue;
    },

    async *keys() {
      sourceKeys ??= await keys(source);
      yield* sourceKeys;
    },
  });
}
