/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { GraphHelpers } from "@graphorigami/core";
import builtins from "../builtins/@builtins.js";
import StringWithGraph from "../common/StringWithGraph.js";
import { getRealmObjectPrototype } from "../common/utilities.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import * as compile from "../language/compile.js";
import toYaml from "./@yaml.js";

/**
 * Parse an Origami expression, evaluate it in the context of a graph (provided
 * by `this`), and return the result as text.
 * @this {AsyncDictionary|null}
 *
 * @param {string} expression
 */
export default async function ori(expression) {
  assertScopeIsDefined(this);
  // In case expression is a Buffer, cast it to a string.
  expression = String(expression).trim();

  // Obtain the scope from `this` or builtins.
  let scope = this ?? builtins;

  // Parse
  const fn = compile.expression(expression);

  // Execute
  let result = await fn.call(scope);

  // If result was a function, execute it.
  if (typeof result === "function") {
    result = await result.call(scope);
  }

  const formatted = await formatResult(scope, result);
  return formatted;
}

async function formatResult(scope, result) {
  if (
    typeof result === "string" ||
    (globalThis.Buffer && result instanceof Buffer)
  ) {
    // Use as is
    return result;
  }

  /** @type {string|Buffer|StringWithGraph|undefined} */
  let text;

  // Does the result have a meaningful toString() method (and not the dumb
  // Object.toString)? Exception: if the result is an array, we'll use YAML
  // instead.
  if (!result) {
    // Return falsy values as is.
    text = result;
  } else if (
    !(result instanceof Array) &&
    "toString" in result &&
    result.toString !== getRealmObjectPrototype(result).toString
  ) {
    text = result.toString();
  } else if (typeof result === "object") {
    // Render YAML
    text = await toYaml.call(scope, result);
  } else {
    // Use result itself.
    text = result;
  }

  // If the result is a graph, attach the graph to the text output.
  if (GraphHelpers.isGraphable(result)) {
    const graph = GraphHelpers.from(result);
    if (text instanceof Buffer) {
      /** @type {any} */ (text).toGraph = () => graph;
    } else {
      text = new StringWithGraph(text, graph);
    }
  }

  return text;
}

ori.usage = `@ori <text>\tEvaluates the text as an Origami expression`;
ori.documentation = "https://graphorigami.org/language/@ori.html";
