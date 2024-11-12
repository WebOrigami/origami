import { Tree } from "@weborigami/async-tree";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Add nextKey/previousKey properties to values.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {import("@weborigami/async-tree").Treelike} treelike
 */
export default async function addNextPrevious(treelike) {
  const tree = await getTreeArgument(
    this,
    arguments,
    treelike,
    "tree:addNextPrevious"
  );
  let keys;
  return Object.create(tree, {
    get: {
      value: async (key) => {
        let value = await tree.get(key);

        if (value === undefined) {
          return undefined;
        } else if (Tree.isTreelike(value)) {
          value = await Tree.plain(value);
        } else if (typeof value === "object") {
          // Clone value to avoid modifying the original object.
          value = { ...value };
        } else if (typeof value === "string") {
          // Upgrade text nodes to objects.
          value = { "@text": value };
        } else {
          // Upgrade other scalar types to objects.
          value = { "@data": value };
        }

        if (keys === undefined) {
          keys = Array.from(await tree.keys());
        }
        const index = keys.indexOf(key);
        if (index === -1) {
          // Key is supported but not published in `keys`
          return value;
        }

        // Extend value with nextKey/previousKey properties.
        const nextKey = keys[index + 1];
        if (nextKey) {
          value.nextKey = nextKey;
        }
        const previousKey = keys[index - 1];
        if (previousKey) {
          value.previousKey = previousKey;
        }
        return value;
      },
      writable: true,
    },
  });
}
