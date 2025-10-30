import AsyncMap from "../drivers/AsyncMap.js";
import SyncMap from "../drivers/SyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import keys from "./keys.js";

/**
 * Return a new grouping of the treelike's values into chunks of the specified
 * size.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @param {number} [size=10]
 */
export default async function paginate(treelike, size = 10) {
  const tree = await getTreeArgument(treelike, "paginate");

  const treeKeys = await keys(tree);
  const pageCount = Math.ceil(treeKeys.length / size);

  const paginated = Object.assign(new AsyncMap(), {
    description: "paginate",

    async get(pageKey) {
      const normalized = trailingSlash.remove(pageKey);
      // Note: page numbers are 1-based.
      const pageNumber = Number(normalized);
      if (Number.isNaN(pageNumber)) {
        return undefined;
      }
      const nextPage = pageNumber + 1 <= pageCount ? pageNumber + 1 : null;
      const previousPage = pageNumber - 1 >= 1 ? pageNumber - 1 : null;
      const items = new SyncMap();
      for (
        let index = (pageNumber - 1) * size;
        index < Math.min(treeKeys.length, pageNumber * size);
        index++
      ) {
        const key = treeKeys[index];
        items.set(key, await tree.get(treeKeys[index]));
      }

      return {
        items,
        nextPage,
        pageCount,
        pageNumber,
        previousPage,
      };
    },

    async *keys() {
      // Return from 1..totalPages
      yield* Array.from({ length: pageCount }, (_, index) => index + 1);
    },

    source: tree,
  });

  return paginated;
}
