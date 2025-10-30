import {
  AsyncMap,
  Tree,
  getTreeArgument,
  jsonKeys,
} from "@weborigami/async-tree";
import indexPage from "./indexPage.js";

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
  const tree = await getTreeArgument(treelike, "static");
  return staticMap(tree);
}

// The name we'll register as a builtin
staticBuiltin.key = "static";

function staticMap(tree) {
  const result = Object.assign(new AsyncMap(), {
    description: "static",

    async get(key) {
      let value = await tree.get(key);
      if (value === undefined && key === "index.html") {
        value = await indexPage(this);
      } else if (value === undefined && key === ".keys.json") {
        value = await jsonKeys.stringify(this);
      } else if (Tree.isTreelike(value)) {
        const subtree = Tree.from(value, { parent: result });
        value = staticMap(subtree);
      }
      return value;
    },

    async *keys() {
      yield* tree.keys();
      yield "index.html";
      yield ".keys.json";
    },

    source: tree,
  });

  return result;
}
