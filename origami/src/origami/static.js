import { Tree, getTreeArgument, jsonKeys } from "@weborigami/async-tree";
import index from "./indexPage.js";

/**
 * Expose common static keys (index.html, .keys.json) for a tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @returns {Promise<AsyncTree>}
 */
export default async function staticBuiltin(treelike) {
  const tree = getTreeArgument(treelike, "static");
  return staticTree(tree);
}

// The name we'll register as a builtin
staticBuiltin.key = "static";

function staticTree(tree) {
  return Object.assign(Object.create(tree), {
    async get(key) {
      let value = await tree.get(key);
      if (value === undefined && key === "index.html") {
        value = await index.call(this, this);
      } else if (value === undefined && key === ".keys.json") {
        value = await jsonKeys.stringify(this);
      } else if (Tree.isTreelike(value)) {
        const subtree = Tree.from(value, { parent: this });
        value = staticTree(subtree);
      }
      return value;
    },

    async keys() {
      const keys = new Set(await tree.keys());
      keys.add("index.html");
      keys.add(".keys.json");
      return keys;
    },
  });
}
