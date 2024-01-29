import { Tree, keysJson } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import { transformObject } from "../../common/utilities.js";
import getTreeArgument from "../../misc/getTreeArgument.js";

/**
 * Expose .keys.json for a tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 */
export default async function treeKeysJson(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike);
  let result = transformObject(KeysJsonTransform, tree);
  result = Scope.treeWithScope(result, this);
  return result;
}

function KeysJsonTransform(Base) {
  return class Static extends Base {
    async get(key) {
      let value = await super.get(key);
      if (value === undefined && key === ".keys.json") {
        value = await keysJson.stringify(this);
      } else if (Tree.isAsyncTree(value)) {
        value = transformObject(KeysJsonTransform, value);
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
