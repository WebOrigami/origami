import { Tree, jsonKeys } from "@weborigami/async-tree";
import { transformObject } from "../common/utilities.js";
import getTreeArgument from "../misc/getTreeArgument.js";
import index from "./index.js";

/**
 * Expose common static keys (index.html, .keys.json) for a tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 */
export default async function staticBuiltin(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "site:static");
  const result = transformObject(StaticTransform, tree);
  result.parent = this;
  return result;
}

function StaticTransform(Base) {
  return class Static extends Base {
    async get(key) {
      let value = await super.get(key);
      if (value === undefined && key === "index.html") {
        value = await index.call(this, this);
      } else if (value === undefined && key === ".keys.json") {
        value = await jsonKeys.stringify(this);
      } else if (Tree.isTreelike(value)) {
        const tree = Tree.from(value, { parent: this });
        value = transformObject(StaticTransform, tree);
      }
      return value;
    }

    async keys() {
      const keys = new Set(await super.keys());
      keys.add("index.html");
      keys.add(".keys.json");
      return keys;
    }
  };
}
