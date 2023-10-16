import { Tree } from "@graphorigami/core";
import ShuffleTransform from "../../common/ShuffleTransform.js";
import { transformObject } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return a new tree with the original's keys shuffled
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 *
 * @this {AsyncDictionary|null}
 * @param {Treelike} [treelike]
 */
export default async function shuffle(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = Tree.from(treelike);
  const shuffled = transformObject(ShuffleTransform, tree);
  return shuffled;
}

shuffle.usage = `shuffle <tree>\tReturn a new tree with the original's keys shuffled`;
shuffle.documentation = "https://graphorigami.org/cli/builtins.html#shuffle";
