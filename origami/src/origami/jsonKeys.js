import {
  AsyncMap,
  Tree,
  getTreeArgument,
  jsonKeys,
} from "@weborigami/async-tree";

/**
 * Expose .keys.json for a tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @returns {Promise<AsyncTree>}
 */
export default async function jsonKeysBuiltin(treelike) {
  const tree = await getTreeArgument(treelike, "jsonKeys");
  return jsonKeysMap(tree);
}

function jsonKeysMap(tree) {
  const result = Object.assign(new AsyncMap(), {
    description: "jsonKeys",

    async get(key) {
      let value = await tree.get(key);
      if (value === undefined && key === ".keys.json") {
        value = await jsonKeys.stringify(this);
      } else if (Tree.isTreelike(value)) {
        const subtree = Tree.from(value, { deep: true, parent: result });
        value = jsonKeysMap(subtree);
      }
      return value;
    },

    async *keys() {
      const treeKeys = new Set(await Tree.keys(tree));
      treeKeys.add(".keys.json");
      yield* treeKeys;
    },

    source: tree,
  });
  return result;
}
