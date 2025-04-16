import { toString } from "@weborigami/async-tree";
import { compile } from "@weborigami/language";
import builtinsTree from "../builtinsTree.js";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import { formatResult } from "./formatResult.js";

/**
 * Parse an Origami expression, evaluate it in the context of a tree (provided
 * by `this`), and return the result as text.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} expression
 */
export default async function ori(
  expression,
  options = { formatResult: true }
) {
  assertTreeIsDefined(this, "origami:ori");

  // In case expression has come from a file, cast it to a string.
  expression = toString(expression);

  // Run in the context of `this` if defined, otherwise use the builtins.
  const tree = this ?? builtinsTree;

  // Compile the expression. Avoid caching scope references so that, e.g.,
  // passing a function to the `watch` builtin will always look the current
  // value of things in scope.
  const fn = compile.expression(expression, { scopeCaching: false });

  // Execute
  let result = await fn.call(tree);

  // If result was a function, execute it.
  if (typeof result === "function") {
    result = await result.call(tree);
  }

  return options.formatResult ? await formatResult(result) : result;
}
