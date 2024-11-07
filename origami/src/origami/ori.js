import {
  Tree,
  getRealmObjectPrototype,
  toString,
} from "@weborigami/async-tree";
import { compile } from "@weborigami/language";
import builtinsTree from "../builtins/builtinsTree.js";
import { toYaml } from "../common/serialize.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

const TypedArray = Object.getPrototypeOf(Uint8Array);

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
ori.description = "ori(text) - Evaluate the text as an Origami expression";

async function formatResult(result) {
  if (
    typeof result === "string" ||
    result instanceof ArrayBuffer ||
    result instanceof TypedArray
  ) {
    // Use as is
    return result;
  }

  /** @type {string|String|undefined} */
  let text;

  // Does the result have a meaningful toString() method (and not the dumb
  // Object.toString)? Exception: if the result is an array, we'll use YAML
  // instead.
  if (!result) {
    // Return falsy values as is.
    text = result;
  } else if (
    !(result instanceof Array) &&
    (typeof result !== "object" ||
      result.toString !== getRealmObjectPrototype(result)?.toString)
  ) {
    text = result.toString();
  } else if (typeof result === "object") {
    // Render YAML
    text = await toYaml(result);
  } else {
    // Use result itself.
    text = result;
  }

  // If the result is treelike, attach it to the text output.
  if (Tree.isTreelike(result)) {
    if (typeof text === "string") {
      // @ts-ignore
      text = new String(text);
    }
    /** @type {any} */ (text).unpack = () => result;
  }

  return text;
}
