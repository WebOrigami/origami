import AsyncMap from "../drivers/AsyncMap.js";
import getMapArgument from "../utilities/getMapArgument.js";

/**
 * Returns a new map with the number of keys limited to the indicated count.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @param {number} count
 */
export default async function take(maplike, count) {
  const source = await getMapArgument(maplike, "Tree.take");
  return Object.assign(new AsyncMap(), {
    description: `take ${count}`,

    async *keys() {
      let i = 0;
      for await (const key of source.keys()) {
        yield key;
        i += 1;
        if (i >= count) {
          break;
        }
      }
    },

    async get(key) {
      return source.get(key);
    },

    source: source,

    trailingSlashKeys: /** @type {any} */ (source).trailingSlashKeys,
  });
}
