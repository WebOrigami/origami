import { Tree } from "../internal.js";
import * as symbols from "../symbols.js";

/**
 * Return a new grouping of the treelike's values into chunks of the specified
 * size.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} [treelike]
 * @param {number} [size=10]
 */
export default async function paginate(treelike, size = 10) {
  const tree = Tree.from(treelike);
  const keys = Array.from(await tree.keys());
  const pageCount = Math.ceil(keys.length / size);

  const paginated = {
    async get(pageKey) {
      // Note: page numbers are 1-based.
      const pageNumber = Number(pageKey);
      if (Number.isNaN(pageNumber)) {
        return undefined;
      }
      const nextPage = pageNumber + 1 <= pageCount ? pageNumber + 1 : null;
      const previousPage = pageNumber - 1 >= 1 ? pageNumber - 1 : null;
      const items = {};
      for (
        let index = (pageNumber - 1) * size;
        index < Math.min(keys.length, pageNumber * size);
        index++
      ) {
        const key = keys[index];
        items[key] = await tree.get(keys[index]);
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

  paginated[symbols.parent] = this;
  return paginated;
}
