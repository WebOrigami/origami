import { Tree, sortNatural } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Return a new tree with the original's keys sorted in natural sort order.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @typedef {import("../../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function sort(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  const tree = Tree.from(treelike);
  const sorted = sortNatural()(tree);
  const scoped = Scope.treeWithScope(sorted, this);
  return scoped;
}

sort.usage = `@sort <tree>, [keyFn]\tReturn a new tree with the original's keys sorted`;
sort.documentation = "https://graphorigami.org/cli/builtins.html#@sort";
