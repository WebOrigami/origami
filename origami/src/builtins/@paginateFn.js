import { Tree } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";

/**
 * Return a new grouping of the treelike's values into chunks of the specified
 * size.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {number} [size=10]
 */
export default function paginateFn(size = 10) {
  const scope = this;
  /**
   * @param {Treelike} [treelike]
   */
  return async function (treelike) {
    const tree = Tree.from(treelike);
    const keys = Array.from(await tree.keys());
    const pageCount = Math.ceil(keys.length / size);

    const result = {
      async get(pageKey) {
        const pageNumber = Number(pageKey);
        if (Number.isNaN(pageNumber)) {
          return undefined;
        }
        const nextKey = pageNumber + 1 < pageCount ? pageNumber + 1 : null;
        const previousKey = pageNumber - 1 >= 0 ? pageNumber - 1 : null;
        const items = {};
        for (
          let index = pageNumber * size;
          index < Math.min(keys.length, (pageNumber + 1) * size);
          index++
        ) {
          const key = keys[index];
          items[key] = await tree.get(keys[index]);
        }
        return {
          items,
          nextKey,
          previousKey,
        };
      },

      async keys() {
        // Return an array from 1..pageCount
        return Array.from({ length: pageCount }, (_, index) => index);
      },
    };

    const scoped = Scope.treeWithScope(result, scope);
    return scoped;
  };
}
