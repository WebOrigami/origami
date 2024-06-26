import { FunctionTree, ObjectTree } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import { toFunction } from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Create a tree from a function and a set of keys.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {Invocable} [invocable]
 */
export default async function fnTree(invocable, keys = []) {
  assertScopeIsDefined(this, "fnTree");
  // A fragment of the logic from getTreeArgument.js
  if (arguments.length > 0 && invocable === undefined) {
    throw new Error(
      "An Origami function was called with an initial argument, but its value is undefined."
    );
  }
  invocable = invocable ?? (await this?.get("@current"));
  if (invocable === undefined) {
    return undefined;
  }
  const invocableFn = toFunction(invocable);

  /** @this {AsyncTree|null} */
  async function extendedFn(key) {
    const ambientsTree = Scope.treeWithScope(
      new ObjectTree({ "@key": key }),
      this
    );
    return invocableFn.call(ambientsTree, key);
  }

  return new FunctionTree(extendedFn, keys);
}

fnTree.usage = `@fnTree <fn>, [<keys>]\tCreate a tree from a function and a set of keys`;
fnTree.documentation = "https://weborigami.org/cli/tree.html#fn";
