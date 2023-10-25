import { Dictionary, Tree } from "@graphorigami/core";
import { treeWithScope } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";
import defineds from "./defineds.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
 * @param {Treelike} treelike
 */
export default async function exceptions(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));

  /** @type {AsyncTree} */
  let exceptionsTree = new ExceptionsTree(treelike);
  if (this) {
    exceptionsTree = treeWithScope(exceptionsTree, this);
  }
  return defineds.call(this, exceptionsTree);
}

/**
 * @implements {AsyncTree}
 */
class ExceptionsTree {
  constructor(treelike) {
    this.tree = Tree.from(treelike);
    this.parent = null;
  }

  async get(key) {
    try {
      const value = await this.tree.get(key);
      return Dictionary.isAsyncDictionary(value)
        ? Reflect.construct(this.constructor, [value])
        : undefined;
    } catch (/** @type {any} */ error) {
      return error.name && error.message
        ? `${error.name}: ${error.message}`
        : error.name ?? error.message ?? error;
    }
  }

  async keys() {
    return this.tree.keys();
  }
}

exceptions.usage = `@tree/exceptions tree\tReturn a tree of exceptions thrown in the tree`;
exceptions.documentation =
  "https://graphorigami.org/cli/builtins.html#exceptions";
