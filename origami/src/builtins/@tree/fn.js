import { FunctionTree } from "@graphorigami/core";
import { toFunction } from "../../common/utilities.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
import Scope from "../../runtime/Scope.js";

/**
 * Create a tree from a function and a set of keys.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @typedef {import("../../..").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {Invocable} [invocable]
 */
export default async function fn(invocable, keys = []) {
  assertScopeIsDefined(this);
  invocable = invocable ?? (await this?.get("@current"));
  if (invocable === undefined) {
    return undefined;
  }
  const invocableFn = toFunction(invocable);

  /** @this {AsyncTree|null} */
  async function extendedFn(key) {
    const ambientsTree = Scope.treeWithScope({ "@key": key }, this);
    return invocableFn.call(ambientsTree, key);
  }

  return new FunctionTree(extendedFn, keys);
}

fn.usage = `fn <fn>, [<keys>]\tCreate a tree from a function and a set of keys`;
fn.documentation = "https://graphorigami.org/cli/tree.html#fn";
