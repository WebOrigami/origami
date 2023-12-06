import { Tree } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import ShuffleTransform from "../../common/ShuffleTransform.js";
import { transformObject } from "../../common/utilities.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Return a new tree with the original's keys shuffled
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function shuffle(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = Tree.from(treelike);

  /** @type {AsyncTree} */
  let shuffled = transformObject(ShuffleTransform, tree);
  shuffled = Scope.treeWithScope(shuffled, this);
  return shuffled;
}

shuffle.usage = `shuffle <tree>\tReturn a new tree with the original's keys shuffled`;
shuffle.documentation = "https://weborigami.org/cli/builtins.html#shuffle";
