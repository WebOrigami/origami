import { Tree, keysJson } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import { transformObject } from "../../common/utilities.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
import index from "../@index.js";

/**
 * Expose common static keys (index.html, .keys.json) for a tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 */
export default async function staticTree(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = Tree.from(treelike);
  let result = transformObject(StaticTransform, tree);
  result = Scope.treeWithScope(result, this);
  return result;
}

function StaticTransform(Base) {
  return class Static extends Base {
    async get(key) {
      let value = await super.get(key);
      if (value === undefined && key === "index.html") {
        value = index.call(this, this);
      } else if (value === undefined && key === ".keys.json") {
        value = keysJson.stringify(this);
      } else if (Tree.isAsyncTree(value)) {
        value = transformObject(StaticTransform, value);
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

staticTree.usage = `static <tree>\tAdd keys for generating common static files`;
staticTree.documentation = "https://graphorigami.org/cli/builtins.html#static";
