import * as trailingSlash from "../trailingSlash.js";
import getTreeArgument from "../utilities/getTreeArgument.js";

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

  const keys = Array.from(await tree.keys());
  const pageCount = Math.ceil(keys.length / size);

  const paginated = {
    async get(pageKey) {
      const normalized = trailingSlash.remove(pageKey);
      // Note: page numbers are 1-based.
      const pageNumber = Number(normalized);
      if (Number.isNaN(pageNumber)) {
        return undefined;
      }
      const nextPage = pageNumber + 1 <= pageCount ? pageNumber + 1 : null;
      const previousPage = pageNumber - 1 >= 1 ? pageNumber - 1 : null;
      const items = new Map();
      for (
        let index = (pageNumber - 1) * size;
        index < Math.min(keys.length, pageNumber * size);
        index++
      ) {
        const key = keys[index];
        items.set(key, await tree.get(keys[index]));
      }

      return {
        items,
        nextPage,
        pageCount,
        pageNumber,
        previousPage,
      };
    },

    async keys() {
      // Return an array from 1..totalPages
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    },
  };

  return paginated;
}
