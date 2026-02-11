import { Tree, args, getRealmObjectPrototype } from "@weborigami/async-tree";
import { compile, projectGlobals } from "@weborigami/language";
import { toYaml } from "../common/serialize.js";
import * as dev from "../dev/dev.js";

const TypedArray = Object.getPrototypeOf(Uint8Array);

/**
 * Parse an Origami expression, evaluate it in the context of a tree (provided
 * by `this`), and return the result as text.
 *
 * @param {import("@weborigami/async-tree").Stringlike} expression
 */
export default async function ori(expression, options = {}) {
  const parent = options.parent ?? null;
  const formatResult = options.formatResult ?? true;

  expression = args.stringlike(expression, "Origami.ori");

  // Add Dev builtins as top-level globals
  const globals = {
    ...(await projectGlobals(parent)),
    ...dev,
  };

  // Compile the expression. Avoid caching scope references so that, e.g.,
  // passing a function to the `watch` builtin will always look the current
  // value of things in scope.
  const fn = compile.expression(expression, {
    globals,
    enableCaching: false,
    mode: "shell",
    parent,
  });

  // Execute
  let result = await fn();

  // If result was a function, execute it.
  if (typeof result === "function") {
    result = await result();
  }

  return formatResult ? await format(result) : result;
}

async function format(result) {
  if (
    typeof result === "string" ||
    result instanceof ArrayBuffer ||
    result instanceof TypedArray
  ) {
    // Use as is
    return result;
  }

  if (result instanceof Response) {
    if (!result.ok) {
      console.warn(`Response not OK: ${result.status} ${result.statusText}`);
      return undefined;
    }
    return await result.arrayBuffer();
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

  // If the result is maplike, attach it to the text output.
  if (Tree.isMaplike(result)) {
    if (typeof text === "string") {
      // @ts-ignore
      text = new String(text);
    }
    /** @type {any} */ (text).unpack = () => result;
  }

  return text;
}
