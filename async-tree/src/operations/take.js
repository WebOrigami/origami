import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Returns a new tree with the number of keys limited to the indicated count.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @param {number} count
 */
export default async function take(maplike, count) {
  const tree = await getTreeArgument(maplike, "take");

  return Object.assign(new AsyncMap(), {
    description: `take ${count}`,

    async *keys() {
      let i = 0;
      for await (const key of tree.keys()) {
        yield key;
        i += 1;
        if (i >= count) {
          break;
        }
      }
    },

    async get(key) {
      return tree.get(key);
    },

    source: tree,
  });
}
