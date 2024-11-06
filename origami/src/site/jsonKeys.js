import { Tree, jsonKeys } from "@weborigami/async-tree";
import { transformObject } from "../common/utilities.js";
import getTreeArgument from "../misc/getTreeArgument.js";

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
    "@keysJson",
    true
  );
  return transformObject(KeysJsonTransform, tree);
}

function KeysJsonTransform(Base) {
  return class Static extends Base {
    async get(key) {
      let value = await super.get(key);
      if (value === undefined && key === ".keys.json") {
        value = await jsonKeys.stringify(this);
      } else if (Tree.isTreelike(value)) {
        const tree = Tree.from(value, { deep: true, parent: this });
        value = transformObject(KeysJsonTransform, tree);
      }
      return value;
    }

    async keys() {
      const keys = new Set(await super.keys());
      keys.add(".keys.json");
      return keys;
    }
  };
}
