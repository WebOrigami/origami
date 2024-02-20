import { Tree } from "@weborigami/async-tree";
import { ops } from "@weborigami/language";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Concatenate the text content of objects or trees.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {any[]} args
 */
export default async function concat(...args) {
  assertScopeIsDefined(this);
  const tree =
    args.length === 0 ? await this?.get("@current") : Tree.from(args);
  return ops.concat.call(this, tree);
}

concat.usage = `@concat <...objs>\tConcatenate text and/or trees of text`;
concat.documentation = "https://weborigami.org/cli/@tree.html#concat";
