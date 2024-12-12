import { symbols } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import { oridocumentHandler } from "../internal.js";

/**
 * Inline any Origami expressions found inside ${...} placeholders in the input
 * text.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 *
 * @this {AsyncTree|null}
 * @param {StringLike} input
 */
export default async function inline(input) {
  assertTreeIsDefined(this, "text:inline");

  const parent =
    /** @type {any} */ (input).parent ??
    /** @type {any} */ (input)[symbols.parent] ??
    this;

  // @ts-ignore
  const fn = await oridocumentHandler.unpack(input, { parent });
  return await fn();
}
