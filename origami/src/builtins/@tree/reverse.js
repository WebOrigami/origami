import { Dictionary, Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Reverse the order of the top-level keys in the tree.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 *
 * @this {AsyncDictionary|null}
 * @param {Treelike} [treelike]
 * @param {PlainObject} [options]
 */
export default async function reverse(treelike, options = {}) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const scope = this;
  const tree = Tree.from(treelike);
  const deep = options.deep ?? false;

  const reversed = {
    async get(key) {
      let value = await tree.get(key);

      if (deep && Dictionary.isAsyncDictionary(value)) {
        value = reverse.call(scope, value, options);
      }

      return value;
    },

    async keys() {
      const keys = Array.from(await tree.keys());
      keys.reverse();
      return keys;
    },
  };

  return reversed;
}

reverse.usage = `reverse <tree>\tReverses the order of the tree's top-level keys`;
reverse.documentation = "https://graphorigami.org/cli/builtins.html#reverse";
