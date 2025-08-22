import { Tree, jsonKeys } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";
import { transformObject } from "../common/utilities.js";
import index from "./indexPage.js";

/**
 * Expose common static keys (index.html, .keys.json) for a tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 */
export default async function staticBuiltin(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "static");
  const result = transformObject(StaticTransform, tree);
  result.parent = this;
  return result;
}

// The name we'll register as a builtin
staticBuiltin.key = "static";

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
