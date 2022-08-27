#!/usr/bin/env node

import yaml from "../builtins/yaml.js";
import builtins from "../cli/builtins.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { incrementCount } from "../core/measure.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import { getScope } from "../framework/scopeUtilities.js";
import execute from "../language/execute.js";
import * as ops from "../language/ops.js";
import * as parse from "../language/parse.js";

/**
 * Parse an Origami expression, evaluate it in the context of a graph (provided
 * by `this`), and return the result as text.
 *
 * @this {Explorable}
 * @param {string} expression
 * @param {string} [path]
 * @returns {Promise<string | String | Buffer | undefined>}
 */
export default async function ori(expression, path) {
  // In case expression is a Buffer, cast it to a string.
  expression = String(expression).trim();

  // Obtain the scope from `this` or builtins.
  let scope = this ?? builtins;

  // Parse
  incrementCount("ori parse");
  const parsed = parse.expression(expression);
  let code = parsed?.value;
  if (!code || parsed.rest !== "") {
    console.error(`ori: could not recognize expression: ${expression}`);
    return;
  }

  if (!expression.endsWith(")")) {
    // The source ends without an explicit parenthesis. If the rightmost call in
    // the code tree is a function, we'll want to invoke it.
    code = patchDanglingFunction(code);
  }

  // If a path was provided, traverse that before evaluating the code.
  //
  // REVIEW: This path-traversing feature of ori exists to support asserts,
  // which often need to traverse a graph before evaluating an assertion. That
  // feels too specific to support in this otherwise general-purpose function.
  // The use of slash-separated paths also feels too specific.
  if (path) {
    const keys = path.split("/");
    const [first, ...rest] = keys;
    let graph = await scope.get(first);
    if (!graph) {
      return undefined;
    }
    graph = transformObject(InheritScopeTransform, graph);
    graph.parent = scope;
    graph = await ExplorableGraph.traverse(graph, ...rest);
    scope = getScope(graph);
  }

  // Execute
  let result = await execute.call(scope, code);

  // If result was a function, execute it.
  if (typeof result === "function") {
    result = await result.call(scope);
  }

  const formatted = await formatResult(result);
  return formatted;
}

async function formatResult(result) {
  const stringOrBuffer =
    typeof result === "string" ||
    (globalThis.Buffer && result instanceof Buffer);
  let output = stringOrBuffer
    ? result
    : result instanceof String
    ? result.toString()
    : result !== undefined
    ? await yaml(result)
    : undefined;
  return output;
}

// If the user didn't explicitly specify end the source with a parenthesis, but
// the rightmost derivation of the code is a function, we'll want to implicitly
// invoke it. We can't tell at this time whether the code is a function or not,
// so we'll change the ops from `ops.scope` to `ops.implicitCall` to check for a
// function at runtime and -- if it's a function -- invoke it.
function patchDanglingFunction(code) {
  if (code instanceof Array) {
    const isGet =
      code.length === 2 && code[0] === ops.scope && typeof code[1] === "string";
    if (isGet) {
      // Change ops.scope to ops.implicitCall
      return [ops.implicitCall, code[1]];
    } else {
      // Recurse
      const last = code[code.length - 1];
      const patched = patchDanglingFunction(last);
      const newCode = code.slice();
      newCode[code.length - 1] = patched;
      return newCode;
    }
  }
  // Return the code as is.
  return code;
}
