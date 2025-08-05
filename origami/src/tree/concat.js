import { Tree } from "@weborigami/async-tree";
import { ops } from "@weborigami/language";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * Concatenate the text content of objects or trees.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {any[]} args
 */
export default async function concat(...args) {
  assertTreeIsDefined(this, "concat");
  const tree = args.length === 0 ? this : Tree.from(args, { parent: this });
  return ops.concat.call(this, tree);
}
