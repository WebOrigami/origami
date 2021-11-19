#!/usr/bin/env node

import process from "process";
import execute from "../../src/eg/execute.js";
import * as ops from "../../src/eg/ops.js";
import config from "./commands/config.js";
import * as parse from "./parse.js";
import showUsage from "./showUsage.js";

async function main(...args) {
  // Set up
  const scope = await config();
  const source = args.join(" ").trim();
  if (!source) {
    await showUsage(scope);
    return;
  }
  const defaultGraph = await scope.get("defaultGraph");
  const graph = await defaultGraph();
  graph.scope = scope;

  // Parse
  const parsed = parse.expression(source);
  let code = parsed?.value;
  if (!code || parsed.rest !== "") {
    console.error(`eg: could not recognize command: ${source}`);
    return;
  }

  if (!source.endsWith(")")) {
    // The source ends without an explicit parenthesis. If the rightmost call in
    // the code tree is a function, we'll want to invoke it.
    code = patchDanglingFunction(code);
  }
  let errorIfResultUndefined = code[0] === ops.get;

  // Execute
  let result = await execute(code, { graph });

  // If result was a function, execute it.
  if (typeof result === "function") {
    errorIfResultUndefined = false;
    result = await result();
  }

  // We don't generally complain if the result is undefined; the user may be
  // invoking a function that does work but doesn't return a result. However, if
  // the request was only a `get` for something that doesn't exist, say so.
  if (result === undefined && errorIfResultUndefined) {
    console.error(`eg: could not find ${code[1]}`);
  }

  // Display the result.
  const stdout = await scope.get("stdout");
  await stdout(result);
}

// If the user didn't explicitly specify end the source with a parenthesis, but
// the rightmost derivation of the code is a function, we'll want to implicitly
// invoke it. We can't tell at this time whether the code is a function or not,
// so we'll change the ops from `ops.get` to `ops.implicitCall` to check for a
// function at runtime and -- if it's a function -- invoke it.
function patchDanglingFunction(code) {
  if (code instanceof Array) {
    const isGet =
      code.length === 2 && code[0] === ops.get && typeof code[1] === "string";
    if (isGet) {
      // Change ops.get to ops.implicitCall
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

// Process command line arguments
const args = process.argv;
args.shift(); // "node"
args.shift(); // name of this script file
// Not sure why we end up with blank arguments; skip them.
while (args[0] === "") {
  args.shift();
}
try {
  await main(...args);
} catch (/** @type {any} */ error) {
  console.error(error);
}
