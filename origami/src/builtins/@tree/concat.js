import { Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
import * as ops from "../../runtime/ops.js";

/**
 * Concatenate the text content of objects or trees.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
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

concat.usage = `concat <...objs>\tConcatenate text and/or trees of text`;
concat.documentation = "https://graphorigami.org/cli/@tree.html#concat";
