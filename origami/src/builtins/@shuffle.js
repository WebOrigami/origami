import ShuffleTransform from "../common/ShuffleTransform.js";
import { transformObject } from "../common/utilities.js";
import getTreeArgument from "../misc/getTreeArgument.js";

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
  const tree = await getTreeArgument(this, arguments, treelike, "@shuffle");
  return transformObject(ShuffleTransform, tree);
}

shuffle.usage = `@shuffle <tree>\tReturn a new tree with the original's keys shuffled`;
shuffle.documentation = "https://weborigami.org/cli/builtins.html#shuffle";
