import { Tree } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
import defineds from "./defineds.js";

/**
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 */
export default async function exceptions(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));

  /** @type {AsyncTree} */
  let exceptionsTree = new ExceptionsTree(treelike);
  exceptionsTree = Scope.treeWithScope(exceptionsTree, this);
  return defineds.call(this, exceptionsTree);
}

/**
 * @implements {AsyncTree}
 */
class ExceptionsTree {
  constructor(treelike) {
    this.tree = Tree.from(treelike);
  }

  async get(key) {
    try {
      const value = await this.tree.get(key);
      return Tree.isAsyncTree(value)
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
