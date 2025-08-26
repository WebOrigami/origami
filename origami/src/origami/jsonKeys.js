import { Tree, jsonKeys } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";

/**
 * Expose .keys.json for a tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 */
export default async function jsonKeysBuiltin(treelike) {
  const tree = await getTreeArgument(
    this,
    arguments,
    treelike,
    "jsonKeys",
    true
  );
  return jsonKeysTree(tree);
}

function jsonKeysTree(tree) {
  return Object.assign(Object.create(tree), {
    async get(key) {
      let value = await tree.get(key);
      if (value === undefined && key === ".keys.json") {
        value = await jsonKeys.stringify(this);
      } else if (Tree.isTreelike(value)) {
        const subtree = Tree.from(value, { deep: true, parent: this });
        value = jsonKeysTree(subtree);
      }
      return value;
    },

    async keys() {
      const keys = new Set(await tree.keys());
      keys.add(".keys.json");
      return keys;
    },
  });
}
